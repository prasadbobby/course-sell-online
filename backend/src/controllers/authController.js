const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail } = require('../services/emailService');
const { sendOtp, verifyOtp } = require('../services/otpService');

// Helper function to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, role = 'student' } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create new user
    const user = await User.create({
      fullName,
      email,
      passwordHash: password, // Will be hashed by pre-save hook
      role: role === 'creator' ? 'creator' : 'student', // Only allow student or creator roles
      creatorStatus: role === 'creator' ? 'pending' : undefined
    });

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    // Return user data without password
    const userData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      creatorStatus: user.creatorStatus
    };

    res.status(201).json({
      success: true,
      token,
      user: userData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// In backend/src/controllers/authController.js - Modify the login function

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    console.log('User found:', user.email, 'Role:', user.role);
    console.log('Stored hash:', user.passwordHash);

    // Test direct password comparison
    const directCompare = await bcrypt.compare(password, user.passwordHash);
    console.log('Direct bcrypt comparison result:', directCompare);

    // Check if password matches using the model method
    const isMatch = await user.comparePassword(password);
    console.log('Model comparePassword result:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    // Return user data without password
    const userData = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage,
      creatorStatus: user.creatorStatus
    };

    res.status(200).json({
      success: true,
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Logout user
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000), // Expires in 10 seconds
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Send OTP for mobile verification
exports.sendOtp = async (req, res) => {
  try {
    const { mobile } = req.body;
    
    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required'
      });
    }
    
    // Check if mobile is already verified by another user
    const existingUser = await User.findOne({ 
      mobile, 
      isMobileVerified: true,
      _id: { $ne: req.user.id } 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is already verified by another user'
      });
    }
    
    // Send OTP via service
    const result = await sendOtp(mobile);
    
    // Update user with mobile number
    await User.findByIdAndUpdate(req.user.id, { mobile });
    
    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      requestId: result.requestId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Verify OTP for mobile verification
exports.verifyOtp = async (req, res) => {
  try {
    const { requestId, otp } = req.body;
    
    if (!requestId || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Request ID and OTP are required'
      });
    }
    
    // Verify OTP via service
    const result = await verifyOtp(requestId, otp);
    
    if (!result.verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }
    
    // Update user with verified mobile
    await User.findByIdAndUpdate(req.user.id, { isMobileVerified: true });
    
    res.status(200).json({
      success: true,
      message: 'Mobile verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // Hash the reset token and save to DB
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
      
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    
    await user.save();
    
    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    // Send email
    const message = `
      You requested a password reset. Please go to this link to reset your password:
      \n\n ${resetUrl} \n\n
      This link is valid for 30 minutes only.
      If you didn't request this, please ignore this email.
    `;
    
    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      message
    });
    
    res.status(200).json({
      success: true,
      message: 'Email sent successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    // Hash the reset token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with the token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    // Update password
    user.passwordHash = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    
    // Generate new token
    const authToken = generateToken(user._id);
    
    res.status(200).json({
      success: true,
      message: 'Password reset successful',
      token: authToken
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};