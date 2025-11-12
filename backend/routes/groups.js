const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const Course = require('../models/Course');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

// Get groups by class code (for current class)
router.get('/class/:classCode', authenticate, authorize('student'), async (req, res) => {
  try {
    const { classCode } = req.params;
    const student = await User.findById(req.userId);

    // Verify student is in this class
    if (student.currentClass !== classCode) {
      return res.status(403).json({ success: false, message: 'You are not enrolled in this class' });
    }

    const groups = await Group.find({ classCode })
      .populate('leader', 'fullName studentId email')
      .populate('members.user', 'fullName studentId email')
      .populate('pendingInvites.user', 'fullName studentId email')
      .populate('pendingRequests.user', 'fullName studentId email');
    
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get groups by class code (public - view only, no restrictions)
router.get('/class/:classCode/public', authenticate, async (req, res) => {
  try {
    const { classCode } = req.params;

    const groups = await Group.find({ classCode })
      .populate('leader', 'fullName studentId email')
      .populate('members.user', 'fullName studentId email')
      .select('-pendingInvites -pendingRequests'); // Hide pending data for public view
    
    res.json({ success: true, data: groups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create group
router.post('/', authenticate, authorize('student'), async (req, res) => {
  try {
    const { groupName, courseId } = req.body;
    const student = await User.findById(req.userId);

    if (!student.currentClass) {
      return res.status(400).json({ success: false, message: 'You must enroll in a class first' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if student is enrolled in this course
    if (!course.enrolledStudents.includes(req.userId) || course.classCode !== student.currentClass) {
      return res.status(403).json({ success: false, message: 'You are not enrolled in this class' });
    }

    // Check if student already in a group
    if (student.currentGroup) {
      return res.status(400).json({ success: false, message: 'You are already in a group. Leave it first.' });
    }

    const group = new Group({
      groupName,
      classCode: student.currentClass,
      course: courseId,
      leader: req.userId,
      members: [{ user: req.userId }],
      status: 'open'
    });

    await group.save();
    await group.populate('leader', 'fullName studentId email');
    await group.populate('members.user', 'fullName studentId email');

    // Update student
    student.currentGroup = group._id;
    await student.save();

    res.status(201).json({ success: true, message: 'Group created successfully', data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Invite student to group
router.post('/:id/invite', authenticate, authorize('student'), async (req, res) => {
  try {
    const { studentId } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Check if requester is group leader
    if (group.leader.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Only leader can invite members' });
    }

    // Find invitee
    const invitee = await User.findOne({ studentId });
    if (!invitee) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Check if invitee is in same class
    if (invitee.currentClass !== group.classCode) {
      return res.status(400).json({ success: false, message: 'Student is not in the same class' });
    }

    // Check if already in group
    if (group.members.some(m => m.user.toString() === invitee._id.toString())) {
      return res.status(400).json({ success: false, message: 'Student already in group' });
    }

    // Check if already invited
    if (group.pendingInvites.some(i => i.user.toString() === invitee._id.toString())) {
      return res.status(400).json({ success: false, message: 'Student already invited' });
    }

    // Check if group is full
    if (group.members.length >= 5) {
      return res.status(400).json({ success: false, message: 'Group is full' });
    }

    // Add invite
    group.pendingInvites.push({ user: invitee._id });
    if (!invitee.groupInvites.includes(group._id)) {
      invitee.groupInvites.push(group._id);
    }
    await group.save();
    await invitee.save();

    res.json({ success: true, message: 'Invitation sent', data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Accept group invite
router.post('/:id/accept-invite', authenticate, authorize('student'), async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    const student = await User.findById(req.userId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Check if invited
    if (!group.pendingInvites.some(i => i.user.toString() === req.userId)) {
      return res.status(400).json({ success: false, message: 'You are not invited to this group' });
    }

    // Check if already in a group
    if (student.currentGroup && student.currentGroup.toString() !== group._id.toString()) {
      return res.status(400).json({ success: false, message: 'You are already in another group' });
    }

    // Check if in same class
    if (student.currentClass !== group.classCode) {
      return res.status(403).json({ success: false, message: 'You are not in the same class' });
    }

    // Add to group
    group.pendingInvites = group.pendingInvites.filter(i => i.user.toString() !== req.userId);
    group.members.push({ user: req.userId });
    await group.save();

    student.currentGroup = group._id;
    student.groupInvites = student.groupInvites.filter(g => g.toString() !== group._id.toString());
    await student.save();

    await group.populate('members.user', 'fullName studentId email');

    res.json({ success: true, message: 'Joined group successfully', data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reject group invite
router.post('/:id/reject-invite', authenticate, authorize('student'), async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    const student = await User.findById(req.userId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    group.pendingInvites = group.pendingInvites.filter(i => i.user.toString() !== req.userId);
    student.groupInvites = student.groupInvites.filter(g => g.toString() !== group._id.toString());

    await group.save();
    await student.save();

    res.json({ success: true, message: 'Invitation rejected' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Leave group
router.post('/:id/leave', authenticate, authorize('student'), async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    const student = await User.findById(req.userId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Remove from group
    group.members = group.members.filter(m => m.user.toString() !== req.userId);

    // If leader left, disband group if empty
    if (group.leader.toString() === req.userId && group.members.length === 0) {
      group.status = 'disbanded';
    }

    await group.save();

    student.currentGroup = null;
    await student.save();

    res.json({ success: true, message: 'Left group successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get my groups/invites
router.get('/my/status', authenticate, authorize('student'), async (req, res) => {
  try {
    const student = await User.findById(req.userId)
      .populate({
        path: 'currentGroup',
        populate: [
          { path: 'leader', select: 'fullName studentId email' },
          { path: 'members.user', select: 'fullName studentId email' },
          { path: 'pendingRequests.user', select: 'fullName studentId email' }
        ]
      })
      .populate({
        path: 'groupInvites',
        populate: { path: 'leader', select: 'fullName studentId' }
      });

    res.json({
      success: true,
      data: {
        currentGroup: student.currentGroup,
        groupInvites: student.groupInvites,
        currentClass: student.currentClass
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get available students to invite (same class, no group)
router.get('/available/students', authenticate, authorize('student'), async (req, res) => {
  try {
    const student = await User.findById(req.userId);

    if (!student.currentClass) {
      return res.status(400).json({ success: false, message: 'You are not enrolled in any class' });
    }

    // Get all students in same class without a group (excluding self)
    const availableStudents = await User.find({
      currentClass: student.currentClass,
      currentGroup: null,
      _id: { $ne: req.userId },
      role: 'student'
    }).select('_id fullName studentId email');

    res.json({ success: true, data: availableStudents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Request to join group
router.post('/:id/request', authenticate, authorize('student'), async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    const student = await User.findById(req.userId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Check if student is in same class
    if (student.currentClass !== group.classCode) {
      return res.status(400).json({ success: false, message: 'You are not in the same class' });
    }

    // Check if already in a group
    if (student.currentGroup) {
      return res.status(400).json({ success: false, message: 'You are already in a group' });
    }

    // Check if already a member
    if (group.members.some(m => m.user.toString() === req.userId)) {
      return res.status(400).json({ success: false, message: 'You are already a member' });
    }

    // Check if already requested
    if (group.pendingRequests.some(r => r.user.toString() === req.userId)) {
      return res.status(400).json({ success: false, message: 'You have already requested to join' });
    }

    // Check if already invited
    if (group.pendingInvites.some(i => i.user.toString() === req.userId)) {
      return res.status(400).json({ success: false, message: 'You are already invited to this group. Accept the invite instead.' });
    }

    // Check if group is full
    if (group.members.length >= 5) {
      return res.status(400).json({ success: false, message: 'Group is full' });
    }

    // Add request
    group.pendingRequests.push({ user: req.userId });
    await group.save();

    res.json({ success: true, message: 'Request sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Accept join request (leader only)
router.post('/:id/accept-request/:userId', authenticate, authorize('student'), async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Check if requester is group leader
    if (group.leader.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Only leader can accept requests' });
    }

    const requestUserId = req.params.userId;
    const requestedUser = await User.findById(requestUserId);

    if (!requestedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if request exists
    if (!group.pendingRequests.some(r => r.user.toString() === requestUserId)) {
      return res.status(400).json({ success: false, message: 'No request found from this user' });
    }

    // Check if user already in another group
    if (requestedUser.currentGroup) {
      // Remove the request
      group.pendingRequests = group.pendingRequests.filter(r => r.user.toString() !== requestUserId);
      await group.save();
      return res.status(400).json({ success: false, message: 'User is already in another group' });
    }

    // Check if group is full
    if (group.members.length >= 5) {
      return res.status(400).json({ success: false, message: 'Group is full' });
    }

    // Remove from pendingRequests
    group.pendingRequests = group.pendingRequests.filter(r => r.user.toString() !== requestUserId);
    
    // Add to members
    group.members.push({ user: requestUserId });
    await group.save();

    // Update user
    requestedUser.currentGroup = group._id;
    await requestedUser.save();

    await group.populate('members.user', 'fullName studentId email');

    res.json({ success: true, message: 'Request accepted successfully', data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reject join request (leader only)
router.post('/:id/reject-request/:userId', authenticate, authorize('student'), async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Check if requester is group leader
    if (group.leader.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Only leader can reject requests' });
    }

    const requestUserId = req.params.userId;

    // Remove from pendingRequests
    group.pendingRequests = group.pendingRequests.filter(r => r.user.toString() !== requestUserId);
    await group.save();

    res.json({ success: true, message: 'Request rejected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel join request
router.post('/:id/cancel-request', authenticate, authorize('student'), async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Remove from pendingRequests
    group.pendingRequests = group.pendingRequests.filter(r => r.user.toString() !== req.userId);
    await group.save();

    res.json({ success: true, message: 'Request cancelled successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
