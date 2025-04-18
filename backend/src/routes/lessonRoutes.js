const express = require('express');
const { 
  getLesson, 
  completeLesson, 
  submitQuiz,
  submitAssignment,
  getLessonProgress
} = require('../controllers/lessonController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(authenticate);

router.get('/:id', getLesson);
router.post('/:id/complete', completeLesson);
router.post('/:id/quiz', submitQuiz);
router.post('/:id/assignment', submitAssignment);
router.get('/progress/:courseId', getLessonProgress);

module.exports = router;