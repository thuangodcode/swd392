const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Group = require('../models/Group');
const Course = require('../models/Course');
const User = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

// Create project (Group Leader only)
router.post('/', authenticate, authorize('student'), async (req, res) => {
  try {
    const { groupId, projectName, description, objectives, techStack, githubRepository } = req.body;

    // Validate group exists
    const group = await Group.findById(groupId).populate('course');
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    // Verify user is the leader
    if (group.leader.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Only group leader can create project' });
    }

    // Check if project already exists for this group
    const existingProject = await Project.findOne({ group: groupId });
    if (existingProject) {
      return res.status(400).json({ success: false, message: 'Project already exists for this group' });
    }

    // Get course to find lecturer
    const course = await Course.findById(group.course);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const project = new Project({
      group: groupId,
      projectName,
      description,
      objectives,
      techStack: techStack || [],
      githubRepository,
      createdBy: req.userId,
      classCode: group.classCode,
      lecturer: course.lecturer,
      status: 'draft'
    });

    await project.save();
    await project.populate([
      { path: 'group', select: 'groupName leader members classCode' },
      { path: 'createdBy', select: 'fullName email studentId' },
      { path: 'lecturer', select: 'fullName email' }
    ]);

    res.status(201).json({ 
      success: true, 
      message: 'Project created successfully', 
      data: project 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Submit project to lecturer for approval (Leader only)
router.post('/:id/submit-for-approval', authenticate, authorize('student'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('group');
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Verify user is the leader
    if (project.createdBy.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Only group leader can submit project' });
    }

    if (project.approvalStatus === 'pending') {
      return res.status(400).json({ success: false, message: 'Project already submitted for approval' });
    }

    project.approvalStatus = 'pending';
    project.submittedToLecturerAt = new Date();
    await project.save();

    res.json({ 
      success: true, 
      message: 'Project submitted to lecturer for approval', 
      data: project 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get project by group ID
router.get('/group/:groupId', authenticate, async (req, res) => {
  try {
    const project = await Project.findOne({ group: req.params.groupId })
      .populate('group', 'groupName leader members classCode')
      .populate('createdBy', 'fullName studentId email')
      .populate('lecturer', 'fullName email')
      .populate('approvedBy', 'fullName email');
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all projects for current user's class
router.get('/my-class', authenticate, authorize('student'), async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user.currentClass) {
      return res.json({ success: true, data: [] });
    }

    const projects = await Project.find({ classCode: user.currentClass })
      .populate('group', 'groupName leader members')
      .populate('createdBy', 'fullName studentId')
      .populate('lecturer', 'fullName email')
      .populate('approvedBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all projects pending approval (Lecturer only)
router.get('/pending-approval', authenticate, authorize('lecturer'), async (req, res) => {
  try {
    const projects = await Project.find({ 
      lecturer: req.userId,
      approvalStatus: 'pending'
    })
      .populate('group', 'groupName classCode')
      .populate('createdBy', 'fullName studentId email')
      .populate('approvedBy', 'fullName email')
      .sort({ submittedToLecturerAt: -1 });

    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all projects by lecturer (for their classes)
router.get('/my-classes', authenticate, authorize('lecturer'), async (req, res) => {
  try {
    const projects = await Project.find({ lecturer: req.userId })
      .populate('group', 'groupName classCode members')
      .populate('createdBy', 'fullName studentId email')
      .populate('approvedBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve project (Lecturer only)
router.post('/:id/approve', authenticate, authorize('lecturer'), async (req, res) => {
  try {
    const { comment } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Verify lecturer owns this project
    if (project.lecturer.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'You are not the lecturer for this project' });
    }

    if (project.approvalStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Project is not pending approval' });
    }

    project.approvalStatus = 'approved';
    project.approvalComment = comment;
    project.approvedBy = req.userId;
    project.approvedAt = new Date();
    project.status = 'in-progress';
    
    await project.save();
    await project.populate([
      { path: 'group', select: 'groupName leader members' },
      { path: 'createdBy', select: 'fullName studentId email' },
      { path: 'lecturer', select: 'fullName email' },
      { path: 'approvedBy', select: 'fullName email' }
    ]);

    res.json({ 
      success: true, 
      message: 'Project approved successfully', 
      data: project 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reject project (Lecturer only)
router.post('/:id/reject', authenticate, authorize('lecturer'), async (req, res) => {
  try {
    const { comment } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Verify lecturer owns this project
    if (project.lecturer.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'You are not the lecturer for this project' });
    }

    if (project.approvalStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Project is not pending approval' });
    }

    project.approvalStatus = 'rejected';
    project.approvalComment = comment || 'Project rejected';
    project.approvedBy = req.userId;
    project.approvedAt = new Date();
    
    await project.save();
    await project.populate([
      { path: 'group', select: 'groupName leader members' },
      { path: 'createdBy', select: 'fullName studentId email' },
      { path: 'lecturer', select: 'fullName email' },
      { path: 'approvedBy', select: 'fullName email' }
    ]);

    res.json({ 
      success: true, 
      message: 'Project rejected', 
      data: project 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update project (Leader only, only if not approved yet)
router.put('/:id', authenticate, authorize('student'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('group');
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Verify user is the leader
    if (project.createdBy.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Only group leader can update project' });
    }

    // Can't update if already approved
    if (project.approvalStatus === 'approved') {
      return res.status(400).json({ success: false, message: 'Cannot update approved project. Contact lecturer if changes needed.' });
    }

    const { projectName, description, objectives, techStack, githubRepository, documentation } = req.body;

    if (projectName) project.projectName = projectName;
    if (description) project.description = description;
    if (objectives) project.objectives = objectives;
    if (techStack) project.techStack = techStack;
    if (githubRepository !== undefined) project.githubRepository = githubRepository;
    if (documentation !== undefined) project.documentation = documentation;

    await project.save();

    res.json({ success: true, message: 'Project updated successfully', data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete project (Leader only, only if not submitted)
router.delete('/:id', authenticate, authorize('student'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Verify user is the leader
    if (project.createdBy.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Only group leader can delete project' });
    }

    // Can't delete if submitted for approval or approved
    if (project.approvalStatus === 'pending' || project.approvalStatus === 'approved') {
      return res.status(400).json({ success: false, message: 'Cannot delete project that is submitted or approved' });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
