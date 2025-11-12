const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  groupName: {
    type: String,
    required: true,
    trim: true
  },
  classCode: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pendingInvites: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    invitedAt: {
      type: Date,
      default: Date.now
    }
  }],
  pendingRequests: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedAt: {
      type: Date,
      default: Date.now
    }
  }],
  leaderVotes: [{
    votedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    votedFor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['open', 'closed', 'full', 'disbanded'],
    default: 'open'
  },
  isFull: {
    type: Boolean,
    default: false
  },
  closeRequestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  closeRequestedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
groupSchema.index({ course: 1, status: 1 });

module.exports = mongoose.model('Group', groupSchema);
