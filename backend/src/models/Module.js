const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
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
    required: false, // Change to false or remove the required property
    default: ""      // Provide a default empty string
  },
  order: {
    type: Number,
    required: true
  }
}, { timestamps: true });


const Module = mongoose.model('Module', moduleSchema);

module.exports = Module;