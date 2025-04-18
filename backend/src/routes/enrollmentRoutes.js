const express = require('express');
const { 
  getEnrollment,
  generateCertificate,
  getEnrollmentStats
} = require('../controllers/enrollmentController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(authenticate);

router.get('/:id', getEnrollment);
router.get('/certificates/:enrollmentId', generateCertificate);
router.get('/stats/me', getEnrollmentStats);

module.exports = router;