const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['video', 'text', 'quiz', 'assignment'],
    required: true
  },
  content: {
    videoUrl: String,
    duration: Number, // in seconds
    htmlContent: String,
    questions: [{
      question: String,
      options: [String],
      correctOption: Number
    }],
    instructions: String,
    submissionType: {
      type: String,
      enum: ['text', 'file', 'link']
    }
  },
  order: {
    type: Number,
    required: true
  },
  isPreview: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;