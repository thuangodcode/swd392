const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { authenticate, authorize } = require('../middleware/auth');

// Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all students (Moderator only)
router.get('/students/all', authenticate, authorize('moderator'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('-password')
      .populate('currentGroup', 'groupName leader members')
      .populate({
        path: 'currentGroup',
        populate: {
          path: 'leader',
          select: 'fullName studentId'
        }
      })
      .sort({ fullName: 1 });

    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all students in a specific class
router.get('/class/:classCode', authenticate, async (req, res) => {
  try {
    const { classCode } = req.params;
    // Allow any authenticated user to view students in any class (read-only)

    const students = await User.find({ 
      currentClass: classCode,
      role: 'student'
    })
    .select('_id studentId fullName email course major currentClass currentGroup')
    .populate('currentGroup', 'groupName')
    .sort({ fullName: 1 });

    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user profile
router.put('/me', authenticate, async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { fullName, email, phone },
      { new: true }
    ).select('-password');

    res.json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// === MODERATOR LECTURER MANAGEMENT ===

// Get all lecturers
router.get('/lecturer/all', authenticate, authorize('moderator'), async (req, res) => {
  try {
    const lecturers = await User.find({ role: 'lecturer' }).select('-password');
    res.json({ success: true, data: lecturers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create lecturer (Moderator only)
router.post('/lecturer/create', authenticate, authorize('moderator'), async (req, res) => {
  try {
    const { studentId, email, password, fullName, major, phone } = req.body;

    // Validate required fields
    if (!studentId || !email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { studentId }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Student ID or Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create lecturer
    const lecturer = new User({
      studentId,
      email,
      password: hashedPassword,
      fullName,
      major: major || '',
      phone: phone || '',
      role: 'lecturer',
      course: 'N/A',
      isActive: true
    });

    await lecturer.save();

    res.status(201).json({
      success: true,
      message: 'Lecturer created successfully',
      data: {
        id: lecturer._id,
        studentId: lecturer.studentId,
        email: lecturer.email,
        fullName: lecturer.fullName,
        role: lecturer.role,
        major: lecturer.major,
        phone: lecturer.phone
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update lecturer (Moderator only)
router.put('/lecturer/:id', authenticate, authorize('moderator'), async (req, res) => {
  try {
    const { fullName, email, phone, major, isActive } = req.body;
    
    const lecturer = await User.findById(req.params.id);
    if (!lecturer || lecturer.role !== 'lecturer') {
      return res.status(404).json({ success: false, message: 'Lecturer not found' });
    }

    // Check if new email already exists
    if (email && email !== lecturer.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }
    }

    if (fullName) lecturer.fullName = fullName;
    if (email) lecturer.email = email;
    if (phone !== undefined) lecturer.phone = phone;
    if (major !== undefined) lecturer.major = major;
    if (isActive !== undefined) lecturer.isActive = isActive;

    await lecturer.save();

    res.json({
      success: true,
      message: 'Lecturer updated successfully',
      data: {
        id: lecturer._id,
        studentId: lecturer.studentId,
        email: lecturer.email,
        fullName: lecturer.fullName,
        role: lecturer.role,
        major: lecturer.major,
        phone: lecturer.phone,
        isActive: lecturer.isActive
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete lecturer (Moderator only)
router.delete('/lecturer/:id', authenticate, authorize('moderator'), async (req, res) => {
  try {
    const lecturer = await User.findById(req.params.id);
    if (!lecturer || lecturer.role !== 'lecturer') {
      return res.status(404).json({ success: false, message: 'Lecturer not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Lecturer deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reset lecturer password (Moderator only)
router.post('/lecturer/:id/reset-password', authenticate, authorize('moderator'), async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const lecturer = await User.findById(req.params.id);
    if (!lecturer || lecturer.role !== 'lecturer') {
      return res.status(404).json({ success: false, message: 'Lecturer not found' });
    }

    const salt = await bcrypt.genSalt(10);
    lecturer.password = await bcrypt.hash(newPassword, salt);
    await lecturer.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
