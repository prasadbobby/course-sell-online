const express = require('express');
const { 
  getUsers,
  updateUser,
  getCourses,
  approveCourse,
  featureCourse,
  getPayments,
  processPayouts,
  getAnalytics,
  processRefund
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected and require admin role
router.use(authenticate);
router.use(authorize('admin'));

// User management
router.get('/users', getUsers);
router.put('/users/:id', updateUser);

// Course management
router.get('/courses', getCourses);
router.put('/courses/:id/approve', approveCourse);
router.put('/courses/:id/feature', featureCourse);

// Payment management
router.get('/payments', getPayments);
router.post('/payouts', processPayouts);
router.post('/refunds', processRefund);

// Analytics
router.get('/analytics', getAnalytics);

module.exports = router;