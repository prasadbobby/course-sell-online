const mongoose = require('mongoose');
const slugify = require('../utils/slugify');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  discountPrice: {
    type: Number,
    default: 0
  },
  discountValidUntil: {
    type: Date
  },
  category: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  whatYouWillLearn: [{
    type: String
  }],
  requirements: [{
    type: String
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  totalDuration: {
    type: Number,
    default: 0 // in minutes
  },
  totalLessons: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  enrolledStudents: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Pre-save middleware to create slug
courseSchema.pre('save', function(next) {
  if (!this.isModified('title')) return next();
  this.slug = slugify(this.title);
  next();
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;