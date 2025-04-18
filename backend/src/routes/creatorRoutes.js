// In backend/src/routes/creatorRoutes.js

const express = require('express');
const { 
  createCourse, 
  uploadCourseThumbnail, 
  updateCourse,
  getCreatorCourses,
  addModule,
  updateModule,
  deleteModule,
  addLesson,
  updateLesson,
  deleteLesson,
  uploadVideo,
  publishCourse,
  getCourseStats,
  getCreatorCourse,
  previewCreatorCourse
} = require('../controllers/creatorController');
const { 
  getCreatorEarnings 
} = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/fileUpload');

const router = express.Router();

// All routes are protected and require creator role
router.use(authenticate);
router.use(authorize('creator'));

// Course management
router.post('/courses', createCourse);
router.get('/courses', getCreatorCourses);
router.put('/courses/:id', updateCourse);
router.post('/courses/:id/publish', publishCourse);
router.get('/courses/:id/stats', getCourseStats);
router.post('/courses/:id/thumbnail', upload.single('thumbnail'), uploadCourseThumbnail);
router.get('/courses/:id/edit', getCreatorCourse);  // Add new route with correct function name
router.get('/courses/:id/preview', previewCreatorCourse);
// router.get('/courses/:id/preview', getCreatorCourse);

// Module management
router.post('/courses/:courseId/modules', addModule);
router.put('/modules/:id', updateModule);
router.delete('/modules/:id', deleteModule);

// Lesson management
router.post('/modules/:moduleId/lessons', addLesson);
router.put('/lessons/:id', updateLesson);
router.delete('/lessons/:id', deleteLesson);
router.post('/lessons/:id/video', upload.single('video'), uploadVideo);

// Earnings
router.get('/earnings', getCreatorEarnings);

module.exports = router;