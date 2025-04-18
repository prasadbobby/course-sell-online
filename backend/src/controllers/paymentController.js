const razorpay = require('../config/payment');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');

// Create order for payment
exports.createOrder = async (req, res) => {
  try {
    const { courseId } = req.body;
    
    // Check if course exists
    const course = await Course.findOne({
      _id: courseId,
      isPublished: true,
      isApproved: true
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId
    });
    
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }
    
    // Determine price (considering discounts)
    const price = course.discountPrice > 0 && 
                  course.discountValidUntil && 
                  new Date(course.discountValidUntil) > new Date() 
      ? course.discountPrice 
      : course.price;
    
    if (price === 0) {
      return res.status(400).json({
        success: false,
        message: 'This is a free course. Use the enroll API instead.'
      });
    }
    
    // Calculate platform fee (20% of the course price)
    const platformFee = Math.round(price * 0.2);
    const creatorPayout = price - platformFee;
    
    // Create Razorpay order
    const options = {
      amount: price * 100, // Razorpay amount is in paisa
      currency: 'INR',
      receipt: `receipt_order_${courseId}_${req.user.id}_${Date.now()}`
    };
    
    const order = await razorpay.orders.create(options);
    
    // Create a pending payment record
    const payment = await Payment.create({
      userId: req.user.id,
      courseId,
      amount: price,
      currency: 'INR',
      status: 'pending',
      paymentMethod: 'razorpay',
      razorpayOrderId: order.id,
      platformFee,
      creatorPayout
    });
    
    res.status(200).json({
      success: true,
      order,
      payment: {
        id: payment._id,
        amount: payment.amount,
        currency: payment.currency
      },
      course: {
        id: course._id,
        title: course.title,
        image: course.thumbnail
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Verify payment
exports.verifyPayment = async (req, res) => {
  try {
    const { 
      paymentId, 
      razorpayPaymentId, 
      razorpayOrderId, 
      razorpaySignature 
    } = req.body;
    
    // Find the payment
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Verify signature
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    if (expectedSignature !== razorpaySignature) {
      // Update payment status to failed
      payment.status = 'failed';
      await payment.save();
      
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }
    
    // Update payment details
    payment.status = 'completed';
    payment.transactionId = razorpayPaymentId;
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    await payment.save();
    
    // Create enrollment
    const enrollment = await Enrollment.create({
      userId: payment.userId,
      courseId: payment.courseId,
      paymentId: payment._id,
      enrollmentDate: Date.now()
    });
    
    // Update course enrolled students count
    await Course.findByIdAndUpdate(payment.courseId, {
      $inc: { enrolledStudents: 1 }
    });
    
    res.status(200).json({
      success: true,
      message: 'Payment successful',
      enrollment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Request refund
exports.requestRefund = async (req, res) => {
  try {
    const { courseId, reason } = req.body;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if enrolled
    const enrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId
    });
    
    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }
    
    // Check if payment exists
    const payment = await Payment.findById(enrollment.paymentId);
    
    if (!payment || payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'No valid payment found for this enrollment'
      });
    }
    
    // Check if eligible for refund (e.g., within 7 days)
    const enrollmentDate = new Date(enrollment.enrollmentDate);
    const currentDate = new Date();
    const daysSinceEnrollment = Math.floor((currentDate - enrollmentDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceEnrollment > 7) {
      return res.status(400).json({
        success: false,
        message: 'Refund period has expired (7 days)'
      });
    }
    
    // Update payment status
    payment.status = 'refund_requested';
    payment.refundReason = reason;
    await payment.save();
    
    res.status(200).json({
      success: true,
      message: 'Refund request submitted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Process refund (admin only)
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

// Get creator earnings
exports.getCreatorEarnings = async (req, res) => {
  try {
    // Get all courses by the creator
    const courses = await Course.find({ creator: req.user.id });
    const courseIds = courses.map(course => course._id);
    
    // Get completed payments for the courses
    const payments = await Payment.find({
      courseId: { $in: courseIds },
      status: 'completed'
    });
    
    // Calculate total earnings
    const totalEarnings = payments.reduce((total, payment) => total + payment.creatorPayout, 0);
    
    // Calculate earnings per course
    const earningsPerCourse = [];
    for (const course of courses) {
      const coursePayments = payments.filter(payment => 
        payment.courseId.toString() === course._id.toString()
      );
      
      const courseEarnings = coursePayments.reduce((total, payment) => 
        total + payment.creatorPayout, 0
      );
      
      earningsPerCourse.push({
        courseId: course._id,
        courseTitle: course.title,
        earnings: courseEarnings,
        enrollments: course.enrolledStudents
      });
    }
    
    // Get monthly earnings for the past 6 months
    const now = new Date();
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
    
    const monthlyEarnings = [];
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const month = monthDate.getMonth();
      const year = monthDate.getFullYear();
      
      // Filter payments for this month
      const monthPayments = payments.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate.getMonth() === month && paymentDate.getFullYear() === year;
      });
      
      const monthlyTotal = monthPayments.reduce((total, payment) => 
        total + payment.creatorPayout, 0
      );
      
      monthlyEarnings.push({
        month: monthDate.toLocaleString('default', { month: 'long' }),
        year,
        earnings: monthlyTotal
      });
    }
    
    res.status(200).json({
      success: true,
      totalEarnings,
      earningsPerCourse,
      monthlyEarnings: monthlyEarnings.reverse() // Show oldest to newest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};