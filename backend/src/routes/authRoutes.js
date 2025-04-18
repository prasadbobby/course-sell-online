const express = require('express');
const { 
  register, 
  login, 
  logout, 
  getMe, 
  sendOtp, 
  verifyOtp,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes
router.get('/me', authenticate, getMe);
router.post('/send-otp', authenticate, sendOtp);
router.post('/verify-otp', authenticate, verifyOtp);

module.exports = router;