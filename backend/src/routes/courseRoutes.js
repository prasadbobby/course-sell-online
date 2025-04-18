const express = require('express');
const { 
  getCourses, 
  getCourse, 
  getCoursePreview, 
  enrollCourse,
  getCategories,
  rateCourse
} = require('../controllers/courseController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getCourses);
router.get('/categories', getCategories);
router.get('/:id/preview', getCoursePreview);

// Protected routes
router.get('/:id', getCourse);
router.post('/:id/enroll', authenticate, enrollCourse);
router.post('/:id/rate', authenticate, rateCourse);

module.exports = router;