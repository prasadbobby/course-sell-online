const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    
    if (role) {
      query.role = role;
    }
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get users
    const users = await User.find(query)
      .select('-passwordHash')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    // Get total count
    const total = await User.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, creatorStatus } = req.body;
    
    // Find user
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user
    if (role) {
      user.role = role;
    }
    
    if (creatorStatus && user.role === 'creator') {
      user.creatorStatus = creatorStatus;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        creatorStatus: user.creatorStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all courses
exports.getCourses = async (req, res) => {
  try {
    const { 
      isPublished, 
      isApproved, 
      search, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Build query
    const query = {};
    
    if (isPublished !== undefined) {
      query.isPublished = isPublished === 'true';
    }
    
    if (isApproved !== undefined) {
      query.isApproved = isApproved === 'true';
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get courses
    const courses = await Course.find(query)
      .populate('creator', 'fullName email')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    // Get total count
    const total = await Course.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Approve course
exports.approveCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;
    
    // Find course
    const course = await Course.findById(id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if course is published
    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Course is not published yet'
      });
    }
    
    // Update course
    course.isApproved = isApproved;
    await course.save();
    
    res.status(200).json({
      success: true,
      message: `Course ${isApproved ? 'approved' : 'rejected'} successfully`,
      course: {
        _id: course._id,
        title: course.title,
        isApproved: course.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Feature course
exports.featureCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFeatured } = req.body;
    
    // Find course
    const course = await Course.findById(id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if course is published and approved
    if (!course.isPublished || !course.isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Course must be published and approved to be featured'
      });
    }
    
    // Update course
    course.isFeatured = isFeatured;
    await course.save();
    
    res.status(200).json({
      success: true,
      message: `Course ${isFeatured ? 'featured' : 'unfeatured'} successfully`,
      course: {
        _id: course._id,
        title: course.title,
        isFeatured: course.isFeatured
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get all payments
exports.getPayments = async (req, res) => {
  try {
    const { 
      status, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    // Build query
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get payments
    const payments = await Payment.find(query)
      .populate('userId', 'fullName email')
      .populate('courseId', 'title')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    
    // Get total count
    const total = await Payment.countDocuments(query);
    
    // Calculate total revenue
    const completedPayments = await Payment.find({ 
      ...query,
      status: 'completed'
    });
    
    const totalRevenue = completedPayments.reduce(
      (total, payment) => total + payment.amount, 
      0
    );
    
    const platformRevenue = completedPayments.reduce(
      (total, payment) => total + payment.platformFee, 
      0
    );
    
    res.status(200).json({
      success: true,
      count: payments.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      totalRevenue,
      platformRevenue,
      payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Process creator payouts
exports.processPayouts = async (req, res) => {
  try {
    const { creatorId } = req.body;
    
    // Find creator
    const creator = await User.findOne({
      _id: creatorId,
      role: 'creator',
      creatorStatus: 'approved'
    });
    
    if (!creator) {
      return res.status(404).json({
        success: false,
        message: 'Creator not found'
      });
    }
    
    // Get creator's courses
    const courses = await Course.find({ creator: creatorId });
    const courseIds = courses.map(course => course._id);
    
    // Find unpaid payments
    const payments = await Payment.find({
      courseId: { $in: courseIds },
      status: 'completed',
      creatorPaid: { $ne: true }
    });
    
    if (payments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No pending payouts for this creator'
      });
    }
    
    // Calculate total payout amount
    const payoutAmount = payments.reduce(
      (total, payment) => total + payment.creatorPayout, 
      0
    );
    
    // Mark payments as paid
    await Payment.updateMany(
      { _id: { $in: payments.map(p => p._id) } },
      { $set: { creatorPaid: true } }
    );
    
    // In a real implementation you would create a Payout model
    // But for this example we'll just return the data
    const payout = {
      creatorId,
      amount: payoutAmount,
      currency: 'INR',
      payments: payments.map(p => p._id),
      status: 'completed',
      processedAt: Date.now()
    };
    
    res.status(200).json({
      success: true,
      message: 'Payout processed successfully',
      payout
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Process refund
exports.processRefund = async (req, res) => {
  try {
    const { paymentId, approve } = req.body;
    
    // Find payment
    const payment = await Payment.findById(paymentId);
    
    if (!payment || payment.status !== 'refund_requested') {
      return res.status(404).json({
        success: false,
        message: 'Refund request not found'
      });
    }
    
    if (approve) {
      // Process refund through Razorpay
      // In a real implementation, you would call Razorpay's refund API
      
      // Update payment status
      payment.status = 'refunded';
      await payment.save();
      
      // Find and delete enrollment
      const enrollment = await Enrollment.findOne({
        paymentId: payment._id
      });
      
      if (enrollment) {
        // Decrease enrolled students count
        await Course.findByIdAndUpdate(payment.courseId, {
          $inc: { enrolledStudents: -1 }
        });
        
        await Enrollment.findByIdAndDelete(enrollment._id);
      }
      
      res.status(200).json({
        success: true,
        message: 'Refund processed successfully'
      });
    } else {
      // Reject refund request
      payment.status = 'completed'; // Revert to completed status
      payment.refundReason = payment.refundReason + ' (Rejected)';
      await payment.save();
      
      res.status(200).json({
        success: true,
        message: 'Refund request rejected'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get platform analytics
exports.getAnalytics = async (req, res) => {
  try {
    // Get user counts
    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ role: 'student' });
    const creators = await User.countDocuments({ role: 'creator' });
    const pendingCreators = await User.countDocuments({ 
      role: 'creator',
      creatorStatus: 'pending'
    });
    
    // Get course counts
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });
    const approvedCourses = await Course.countDocuments({ 
      isPublished: true,
      isApproved: true 
    });
    const pendingCourses = await Course.countDocuments({ 
      isPublished: true,
      isApproved: false
    });
    
    // Get enrollment counts
    const totalEnrollments = await Enrollment.countDocuments();
    
    // Get payment stats
    const completedPayments = await Payment.find({ status: 'completed' });
    const totalRevenue = completedPayments.reduce(
      (total, payment) => total + payment.amount, 
      0
    );
    const platformRevenue = completedPayments.reduce(
      (total, payment) => total + payment.platformFee, 
      0
    );
    
    // Get monthly revenue for the past 6 months
    const now = new Date();
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
    
    const monthlyRevenue = [];
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const month = monthDate.getMonth();
      const year = monthDate.getFullYear();
      
      // Filter payments for this month
      const monthPayments = completedPayments.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate.getMonth() === month && paymentDate.getFullYear() === year;
      });
      
      const monthlyTotal = monthPayments.reduce(
        (total, payment) => total + payment.amount,
        0
      );
      
      const monthlyPlatformRevenue = monthPayments.reduce(
        (total, payment) => total + payment.platformFee,
        0
      );
      
      monthlyRevenue.push({
        month: monthDate.toLocaleString('default', { month: 'long' }),
        year,
        revenue: monthlyTotal,
        platformRevenue: monthlyPlatformRevenue
      });
    }
    
    res.status(200).json({
      success: true,
      users: {
        total: totalUsers,
        students,
        creators,
        pendingCreators
      },
      courses: {
        total: totalCourses,
        published: publishedCourses,
        approved: approvedCourses,
        pending: pendingCourses
      },
      enrollments: totalEnrollments,
      revenue: {
        total: totalRevenue,
        platform: platformRevenue
      },
      monthlyRevenue: monthlyRevenue.reverse() // Show oldest to newest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};