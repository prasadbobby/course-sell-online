const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    trim: true
  },
  isMobileVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['admin', 'creator', 'student'],
    default: 'student'
  },
  profileImage: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  socialLinks: {
    website: String,
    youtube: String,
    linkedin: String,
    twitter: String
  },
  creatorStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date
}, { timestamps: true });

// Method to compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
  console.log('Comparing passwords:');
  console.log('Entered password:', enteredPassword);
  console.log('Stored hash:', this.passwordHash);
  
  // Make sure you're using the correct function
  try {
    const isMatch = await bcrypt.compare(enteredPassword, this.passwordHash);
    console.log('Password match result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Password comparison error:', error);
    return false;
  }
};


// Middleware to hash password before saving
userSchema.pre('save', async function(next) {
  console.log('Pre-save hook triggered');
  console.log('Is password modified:', this.isModified('passwordHash'));
  
  if (!this.isModified('passwordHash')) return next();
  
  try {
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    console.log('Salt generated:', salt);
    const originalPassword = this.passwordHash;
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    console.log('Original password:', originalPassword);
    console.log('Hashed password:', this.passwordHash);
    next();
  } catch (error) {
    console.error('Password hashing error:', error);
    next(error);
  }
});


const User = mongoose.model('User', userSchema);

module.exports = User;