const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    default: 'EXE101',
    trim: true,
    uppercase: true
  },
  classCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: 6,
    minlength: 6
  },
  courseName: {
    type: String,
    default: 'Enterprise Application Development'
  },
  lecturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  semester: {
    type: String,
    required: true,
    enum: ['SPRING', 'SUMMER', 'FALL'],
    trim: true,
    uppercase: true
  },
  year: {
    type: Number,
    required: true
  },
  room: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },
  schedule: {
    dayOfWeek: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
      enum: [1, 2, 3, 4, 5, 6, 7]
    },
    startTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    endTime: {
      type: String,
      required: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    }
  },
  maxStudents: {
    type: Number,
    required: true,
    default: 40,
    min: 5,
    max: 100
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open'
  },
  groupSize: {
    min: {
      type: Number,
      default: 3
    },
    max: {
      type: Number,
      default: 5
    }
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate schedule
courseSchema.index({ 'schedule.dayOfWeek': 1, 'schedule.startTime': 1, lecturer: 1 });
courseSchema.index({ 'schedule.dayOfWeek': 1, 'schedule.startTime': 1, room: 1 });

// Virtual: number of current students
courseSchema.virtual('currentStudents').get(function() {
  return this.enrolledStudents.length;
});

// Virtual: check if full
courseSchema.virtual('isFull').get(function() {
  return this.enrolledStudents.length >= this.maxStudents;
});

// Pre-save: update status when full
courseSchema.pre('save', function(next) {
  if (this.isFull) {
    this.status = 'closed';
  } else {
    this.status = 'open';
  }
  next();
});

courseSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);
