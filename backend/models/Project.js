const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
    unique: true
  },
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  objectives: {
    type: String
  },
  techStack: [{
    type: String,
    trim: true
  }],
  githubRepository: {
    type: String,
    trim: true
  },
  documentation: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  classCode: {
    type: String,
    required: true
  },
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvalComment: {
    type: String
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  submittedToLecturerAt: {
    type: Date
  },
  milestones: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    deadline: Date,
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date
  }],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'in-progress', 'completed'],
    default: 'draft'
  },
  submittedAt: {
    type: Date
  },
  grade: {
    type: Number,
    min: 0,
    max: 10
  },
  feedback: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
