const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

// Helper function to check schedule conflicts
const checkScheduleConflict = async (dayOfWeek, startTime, endTime, lecturerId, roomId, excludeCourseId = null) => {
  // Convert time strings to minutes for comparison
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const newStart = timeToMinutes(startTime);
  const newEnd = timeToMinutes(endTime);

  // Check lecturer conflict
  let query = {
    'schedule.dayOfWeek': dayOfWeek,
    lecturer: lecturerId
  };
  
  if (excludeCourseId) {
    query._id = { $ne: excludeCourseId };
  }

  const lecturerConflicts = await Course.find(query).populate('lecturer', 'fullName');
  
  for (const course of lecturerConflicts) {
    const existStart = timeToMinutes(course.schedule.startTime);
    const existEnd = timeToMinutes(course.schedule.endTime);
    
    // Check if times overlap
    if (newStart < existEnd && newEnd > existStart) {
      return { 
        conflict: true, 
        message: `Lecturer conflict: ${course.lecturer.fullName} already has class ${course.classCode} from ${course.schedule.startTime}-${course.schedule.endTime} on this day` 
      };
    }
  }

  // Check room conflict
  query = {
    'schedule.dayOfWeek': dayOfWeek,
    room: roomId
  };
  
  if (excludeCourseId) {
    query._id = { $ne: excludeCourseId };
  }

  const roomConflicts = await Course.find(query).populate('lecturer', 'fullName');
  
  for (const course of roomConflicts) {
    const existStart = timeToMinutes(course.schedule.startTime);
    const existEnd = timeToMinutes(course.schedule.endTime);
    
    // Check if times overlap
    if (newStart < existEnd && newEnd > existStart) {
      return { 
        conflict: true, 
        message: `Room conflict: Room ${roomId} is occupied by class ${course.classCode} (${course.lecturer.fullName}) from ${course.schedule.startTime}-${course.schedule.endTime} on this day` 
      };
    }
  }

  return { conflict: false };
};

// Get all available courses
router.get('/available', async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('lecturer', 'fullName email studentId')
      .populate('createdBy', 'fullName email')
      .populate('enrolledStudents', 'studentId fullName');
    
    const formattedCourses = courses.map(course => ({
      _id: course._id,
      courseCode: course.courseCode,
      classCode: course.classCode,
      courseName: course.courseName,
      lecturer: course.lecturer,
      createdBy: course.createdBy,
      semester: course.semester,
      year: course.year,
      room: course.room,
      schedule: course.schedule,
      maxStudents: course.maxStudents,
      currentStudents: course.enrolledStudents.length,
      status: course.enrolledStudents.length >= course.maxStudents ? 'closed' : 'open',
      enrolledStudents: course.enrolledStudents
    }));
    
    res.json({ success: true, data: formattedCourses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all lecturers (for moderator to select)
router.get('/lecturers/list', authenticate, authorize('moderator'), async (req, res) => {
  try {
    const lecturers = await User.find({ role: 'lecturer' }).select('_id fullName email studentId');
    res.json({ success: true, data: lecturers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('lecturer', 'fullName email')
      .populate('createdBy', 'fullName email')
      .populate('enrolledStudents', 'studentId fullName email');
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create class (Moderator only)
router.post('/', authenticate, authorize('moderator'), async (req, res) => {
  try {
    const { classCode, lecturerId, semester, year, room, dayOfWeek, startTime, endTime, maxStudents } = req.body;

    // Validate required fields
    if (!classCode || !lecturerId || !semester || !year || !room || !dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Validate dayOfWeek
    if (dayOfWeek < 1 || dayOfWeek > 7) {
      return res.status(400).json({ success: false, message: 'Invalid day of week (1-7)' });
    }

    // Validate semester
    if (!['SPRING', 'SUMMER', 'FALL'].includes(semester.toUpperCase())) {
      return res.status(400).json({ success: false, message: 'Invalid semester (SPRING, SUMMER, FALL)' });
    }

    // Check if classCode already exists
    const existingClass = await Course.findOne({ classCode: classCode.toUpperCase() });
    if (existingClass) {
      return res.status(400).json({ success: false, message: 'Error: Class code already exists in system' });
    }

    // Check if lecturer exists
    const lecturer = await User.findById(lecturerId);
    if (!lecturer || lecturer.role !== 'lecturer') {
      return res.status(400).json({ success: false, message: 'Error: Invalid lecturer selected' });
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({ success: false, message: 'Error: Invalid time format (HH:MM)' });
    }

    // Check if endTime is after startTime
    const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
    
    if (endMinutes <= startMinutes) {
      return res.status(400).json({ success: false, message: 'Error: End time must be after start time' });
    }

    // Check for schedule conflicts
    const conflictCheck = await checkScheduleConflict(dayOfWeek, startTime, endTime, lecturerId, room.toUpperCase());
    if (conflictCheck.conflict) {
      return res.status(400).json({ success: false, message: `Error: ${conflictCheck.message}` });
    }

    // Create course
    const course = new Course({
      classCode: classCode.toUpperCase(),
      lecturer: lecturerId,
      createdBy: req.userId,
      semester: semester.toUpperCase(),
      year: parseInt(year),
      room: room.toUpperCase(),
      schedule: {
        dayOfWeek: parseInt(dayOfWeek),
        startTime,
        endTime
      },
      maxStudents: parseInt(maxStudents) || 40,
      courseCode: 'EXE101',
      courseName: 'Enterprise Application Development'
    });

    await course.save();
    await course.populate('lecturer', 'fullName email studentId');
    await course.populate('createdBy', 'fullName email');

    res.status(201).json({ 
      success: true, 
      message: 'Class created successfully', 
      data: course 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update class (Moderator only)
router.put('/:id', authenticate, authorize('moderator'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // If changing schedule, validate conflicts
    if (req.body.schedule) {
      const { dayOfWeek, startTime, endTime } = req.body.schedule;
      const conflictCheck = await checkScheduleConflict(
        dayOfWeek, 
        startTime, 
        endTime, 
        req.body.lecturerId || course.lecturer.toString(), 
        req.body.room || course.room,
        req.params.id
      );
      
      if (conflictCheck.conflict) {
        return res.status(400).json({ success: false, message: conflictCheck.message });
      }
    }

    // If changing lecturer, validate
    if (req.body.lecturerId) {
      const lecturer = await User.findById(req.body.lecturerId);
      if (!lecturer || lecturer.role !== 'lecturer') {
        return res.status(400).json({ success: false, message: 'Invalid lecturer' });
      }
    }

    Object.assign(course, req.body);
    await course.save();
    await course.populate('lecturer', 'fullName email');
    
    res.json({ success: true, message: 'Class updated successfully', data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Enroll student
router.post('/:id/enroll', authenticate, authorize('student'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const student = await User.findById(req.userId);
    
    // Check if student already enrolled in this class
    if (course.enrolledStudents.includes(req.userId)) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this class' });
    }

    // Check if student already has currentClass (can only enroll in 1 class at a time)
    if (student.currentClass) {
      return res.status(400).json({ 
        success: false, 
        message: `You are already enrolled in class ${student.currentClass}. Please unenroll from that class first or use the switch class function.` 
      });
    }

    if (course.enrolledStudents.length >= course.maxStudents) {
      return res.status(400).json({ success: false, message: 'This class is full' });
    }

    // Add student to course
    course.enrolledStudents.push(req.userId);
    await course.save();

    // Set as currentClass and add to enrolledClasses
    student.currentClass = course.classCode;
    if (!student.enrolledClasses.includes(course.classCode)) {
      student.enrolledClasses.push(course.classCode);
    }
    await student.save();

    res.json({ success: true, message: 'Enrolled successfully', data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Unenroll student
router.post('/:id/unenroll', authenticate, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    course.enrolledStudents = course.enrolledStudents.filter(
      id => id.toString() !== req.userId
    );
    await course.save();

    // Remove classCode from student's currentClass and enrolledClasses
    const student = await User.findById(req.userId);
    if (student) {
      if (student.currentClass === course.classCode) {
        student.currentClass = null;
      }
      student.enrolledClasses = student.enrolledClasses.filter(
        code => code !== course.classCode
      );
      // If student is in a group from this class, remove from group
      if (student.currentGroup) {
        const Group = require('../models/Group');
        const group = await Group.findById(student.currentGroup);
        if (group && group.classCode === course.classCode) {
          group.members = group.members.filter(m => m.user.toString() !== req.userId);
          await group.save();
          student.currentGroup = null;
        }
      }
      await student.save();
    }

    res.json({ success: true, message: 'Unenrolled successfully', data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Switch class (unenroll from current, enroll to new)
router.post('/:id/switch', authenticate, authorize('student'), async (req, res) => {
  try {
    const newCourse = await Course.findById(req.params.id);
    
    if (!newCourse) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const student = await User.findById(req.userId);

    // If student has currentClass, unenroll from it first
    if (student.currentClass) {
      const oldCourse = await Course.findOne({ classCode: student.currentClass });
      if (oldCourse) {
        oldCourse.enrolledStudents = oldCourse.enrolledStudents.filter(
          id => id.toString() !== req.userId
        );
        await oldCourse.save();

        // Remove from group if in one
        if (student.currentGroup) {
          const Group = require('../models/Group');
          const group = await Group.findById(student.currentGroup);
          if (group && group.classCode === student.currentClass) {
            group.members = group.members.filter(m => m.user.toString() !== req.userId);
            await group.save();
            student.currentGroup = null;
          }
        }
      }
    }

    // Check if already enrolled in new class
    if (newCourse.enrolledStudents.includes(req.userId)) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this class' });
    }

    // Check if new class is full
    if (newCourse.enrolledStudents.length >= newCourse.maxStudents) {
      return res.status(400).json({ success: false, message: 'This class is full' });
    }

    // Enroll in new class
    newCourse.enrolledStudents.push(req.userId);
    await newCourse.save();

    // Update student
    student.currentClass = newCourse.classCode;
    if (!student.enrolledClasses.includes(newCourse.classCode)) {
      student.enrolledClasses.push(newCourse.classCode);
    }
    await student.save();

    res.json({ success: true, message: 'Switched class successfully', data: newCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
