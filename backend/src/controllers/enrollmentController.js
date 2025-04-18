const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Certificate = require('../models/Certificate');
const { v4: uuidv4 } = require('uuid');
const { uploadToS3 } = require('../middleware/fileUpload');

// Get enrollment details
exports.getEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find enrollment
    const enrollment = await Enrollment.findById(id)
      .populate('courseId', 'title thumbnail description creator level')
      .populate('lastAccessedLesson', 'title moduleId');
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    // Check if user owns the enrollment
    if (enrollment.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this enrollment'
      });
    }
    
    res.status(200).json({
      success: true,
      enrollment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Generate certificate
exports.generateCertificate = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    
    // Find enrollment
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('courseId', 'title creator');
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    // Check if user owns the enrollment
    if (enrollment.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to generate this certificate'
      });
    }
    
    // Check if course is completed (progress is 100%)
    if (enrollment.progress < 100) {
      return res.status(400).json({
        success: false,
        message: 'You need to complete the course to get a certificate'
      });
    }
    
    // Check if certificate already exists
    if (enrollment.certificateIssued && enrollment.certificateUrl) {
      return res.status(200).json({
        success: true,
        message: 'Certificate already generated',
        certificateUrl: enrollment.certificateUrl
      });
    }
    
    // Generate certificate ID
    const certificateId = uuidv4();
    
    // In a real implementation, you would generate a PDF certificate here
    // For this example, we'll create a placeholder URL
    const certificateUrl = `https://example.com/certificates/${certificateId}`;
    
    // Create certificate record
    const certificate = await Certificate.create({
      userId: enrollment.userId,
      courseId: enrollment.courseId._id,
      enrollmentId: enrollment._id,
      certificateUrl,
      certificateId
    });
    
    // Update enrollment
    enrollment.certificateIssued = true;
    enrollment.certificateUrl = certificateUrl;
    await enrollment.save();
    
    res.status(200).json({
      success: true,
      message: 'Certificate generated successfully',
      certificateUrl,
      certificateId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get enrollment statistics
exports.getEnrollmentStats = async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Total courses enrolled
    const totalEnrollments = await Enrollment.countDocuments({ userId });
    
    // Completed courses
    const completedCourses = await Enrollment.countDocuments({ 
      userId,
      progress: 100
    });
    
    // Certificates earned
    const certificatesEarned = await Certificate.countDocuments({ userId });
    
    // Get the most recent enrollment
    const latestEnrollment = await Enrollment.findOne({ userId })
      .sort({ enrollmentDate: -1 })
      .populate('courseId', 'title thumbnail');
    
    // Get the most recently accessed course
    const recentlyAccessed = await Enrollment.findOne({ 
      userId,
      lastAccessedAt: { $exists: true }
    })
      .sort({ lastAccessedAt: -1 })
      .populate('courseId', 'title thumbnail')
      .populate('lastAccessedLesson', 'title');
    
    // Calculate average progress across all enrollments
    const enrollments = await Enrollment.find({ userId });
    const totalProgress = enrollments.reduce((acc, enrollment) => acc + enrollment.progress, 0);
    const averageProgress = totalProgress / (enrollments.length || 1);
    
    res.status(200).json({
      success: true,
      stats: {
        totalEnrollments,
        completedCourses,
        certificatesEarned,
        averageProgress,
        latestEnrollment,
        recentlyAccessed
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};