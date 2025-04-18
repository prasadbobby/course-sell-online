const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { upload, uploadFile } = require('../middleware/fileUpload');


// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, bio, socialLinks } = req.body;
    
    const updateData = {
      fullName: fullName || req.user.fullName,
      bio: bio || req.user.bio,
      socialLinks: socialLinks || req.user.socialLinks
    };
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');
    
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

// Upload profile image
exports.uploadProfileImage = async (req, res) => {
  try {
    console.log('Profile image upload request received');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }
    
    // Upload using our smart function that tries multiple services
    const profileImageUrl = await uploadFile(req.file, 'profile-images');
    console.log('Profile image uploaded to:', profileImageUrl);
    
    // Update user profile with image URL
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: profileImageUrl },
      { new: true }
    ).select('-passwordHash');
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload profile image'
    });
  }
};


// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await User.findById(req.user.id);
    
    // Check if current password matches
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.passwordHash = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Apply to become a creator
exports.becomeCreator = async (req, res) => {
  try {
    // Check if user is already a creator or has a pending application
    if (req.user.role === 'creator') {
      return res.status(400).json({
        success: false,
        message: 'You are already a creator'
      });
    }
    
    const { experience, expertise, reason } = req.body;
    
    // Update user role to creator and set status to pending
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        role: 'creator',
        creatorStatus: 'pending',
        bio: req.body.bio || req.user.bio
      },
      { new: true }
    );
    
    // Save application details (could be in a separate collection for more complex applications)
    
    res.status(200).json({
      success: true,
      message: 'Creator application submitted successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get enrolled courses
exports.getEnrolledCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user.id })
      .populate({
        path: 'courseId',
        select: 'title thumbnail description creator level rating enrolledStudents',
        populate: {
          path: 'creator',
          select: 'fullName profileImage'
        }
      })
      .sort({ enrollmentDate: -1 });
    
    const enrolledCourses = enrollments.map(enrollment => {
      return {
        enrollmentId: enrollment._id,
        progress: enrollment.progress,
        enrollmentDate: enrollment.enrollmentDate,
        course: enrollment.courseId
      };
    });
    
    res.status(200).json({
      success: true,
      count: enrolledCourses.length,
      enrolledCourses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get wishlist courses
exports.getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'wishlist',
      select: 'title thumbnail description creator price level rating',
      populate: {
        path: 'creator',
        select: 'fullName profileImage'
      }
    });
    
    if (!user.wishlist) {
      user.wishlist = [];
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      wishlist: user.wishlist
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add course to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { courseId } = req.body;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Add to wishlist if not already in it
    const user = await User.findById(req.user.id);
    
    if (!user.wishlist) {
      user.wishlist = [];
    }
    
    if (user.wishlist.includes(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'Course already in wishlist'
      });
    }
    
    user.wishlist.push(courseId);
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Course added to wishlist'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Remove course from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Remove from wishlist
    const user = await User.findById(req.user.id);
    
    if (!user.wishlist) {
      user.wishlist = [];
    }
    
    user.wishlist = user.wishlist.filter(id => id.toString() !== courseId);
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Course removed from wishlist'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update creator application details
exports.updateCreatorApplication = async (req, res) => {
  try {
    // Check if user is already a creator with pending status
    if (req.user.role !== 'creator' || req.user.creatorStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only update pending creator applications'
      });
    }
    
    const { experience, expertise, reason } = req.body;
    
    // Update bio if provided
    if (req.body.bio) {
      req.user.bio = req.body.bio;
    }
    
    // Store application details (could be in a separate collection)
    // For now, we'll just update the user
    
    await req.user.save();
    
    res.status(200).json({
      success: true,
      message: 'Creator application updated successfully',
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
