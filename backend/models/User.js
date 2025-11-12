const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['student', 'leader', 'lecturer', 'moderator'],
    default: 'student'
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  currentClass: {
    type: String,
    trim: true,
    uppercase: true,
    default: null
  },
  enrolledClasses: [{
    type: String,
    trim: true,
    uppercase: true
  }],
  currentGroup: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null
  },
  groupInvites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }],
  major: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
