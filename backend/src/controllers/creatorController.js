const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const { upload, uploadFile } = require('../middleware/fileUpload');

// Create course
exports.createCourse = async (req, res) => {
  try {
    // Check if user is a creator and approved
    if (req.user.role !== 'creator' || req.user.creatorStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'You must be an approved creator to create courses'
      });
    }
    
    const {
      title,
      description,
      price,
      category,
      level,
      whatYouWillLearn,
      requirements
    } = req.body;
    
    // Create course
    const course = await Course.create({
      title,
      description,
      creator: req.user.id,
      price: parseFloat(price) || 0,
      category,
      level: level || 'beginner',
      whatYouWillLearn: Array.isArray(whatYouWillLearn) ? whatYouWillLearn : [],
      requirements: Array.isArray(requirements) ? requirements : [],
      // Use a placeholder thumbnail initially
      thumbnail: 'https://placehold.co/800x450?text=Course+Thumbnail'
    });
    
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Upload course thumbnail
exports.uploadCourseThumbnail = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if course exists and is owned by the creator
    const course = await Course.findOne({
      _id: id,
      creator: req.user.id
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not have permission'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a thumbnail image'
      });
    }
    
    // Upload using our smart function
    const thumbnailUrl = await uploadFile(req.file, 'course-thumbnails');
    
    // Update course with thumbnail URL
    course.thumbnail = thumbnailUrl;
    await course.save();
    
    res.status(200).json({
      success: true,
      message: 'Thumbnail uploaded successfully',
      thumbnail: thumbnailUrl
    });
  } catch (error) {
    console.error("Error uploading thumbnail:", error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload thumbnail'
    });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if course exists and is owned by the creator
    const course = await Course.findOne({
      _id: id,
      creator: req.user.id
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not have permission'
      });
    }
    
    // Check if course is already published
    if (course.isPublished) {
      // Allow only specific fields to be updated after publishing
      const { 
        price, 
        discountPrice, 
        discountValidUntil,
        whatYouWillLearn,
        requirements,
        tags
      } = req.body;
      
      // Update allowed fields
      if (price !== undefined) course.price = parseFloat(price);
      if (discountPrice !== undefined) course.discountPrice = parseFloat(discountPrice);
      if (discountValidUntil) course.discountValidUntil = new Date(discountValidUntil);
      if (Array.isArray(whatYouWillLearn)) course.whatYouWillLearn = whatYouWillLearn;
      if (Array.isArray(requirements)) course.requirements = requirements;
      if (Array.isArray(tags)) course.tags = tags;
      
      await course.save();
      
      return res.status(200).json({
        success: true,
        message: 'Course updated successfully (limited fields after publishing)',
        course
      });
    }
    
    // If not published, allow full update
    const {
      title,
      description,
      price,
      category,
      level,
      whatYouWillLearn,
      requirements,
      tags
    } = req.body;
    
    // Update course
    if (title) course.title = title;
    if (description) course.description = description;
    if (price !== undefined) course.price = parseFloat(price);
    if (category) course.category = category;
    if (level) course.level = level;
    if (Array.isArray(whatYouWillLearn)) course.whatYouWillLearn = whatYouWillLearn;
    if (Array.isArray(requirements)) course.requirements = requirements;
    if (Array.isArray(tags)) course.tags = tags;
    
    await course.save();
    
    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course
    });
} catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get creator courses
exports.getCreatorCourses = async (req, res) => {
  try {
    const { published, approved, search } = req.query;
    
    // Build query
    const query = { creator: req.user.id };
    
    if (published !== undefined) {
      query.isPublished = published === 'true';
    }
    
    if (approved !== undefined) {
      query.isApproved = approved === 'true';
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get courses
    const courses = await Course.find(query).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add module to course
exports.addModule = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description } = req.body;
    
    console.log("Adding module to course:", courseId);
    console.log("Module data:", { title, description });
    
    // Check if course exists and is owned by the creator
    const course = await Course.findOne({
      _id: courseId,
      creator: req.user.id
    });
    
    if (!course) {
      console.log("Course not found or not owned by creator");
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not have permission'
      });
    }
    
    // Get the highest order value to append the new module
    const lastModule = await Module.findOne({ courseId })
      .sort({ order: -1 });
    
    const order = lastModule ? lastModule.order + 1 : 1;
    
    // Create module
    const module = await Module.create({
      courseId,
      title,
      description,
      order
    });
    
    console.log("Module created successfully:", module);
    
    res.status(201).json({
      success: true,
      message: 'Module added successfully',
      module
    });
  } catch (error) {
    console.error("Error adding module:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update module
exports.updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, order } = req.body;
    
    // Find module
    const module = await Module.findById(id);
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    // Check if course is owned by the creator
    const course = await Course.findOne({
      _id: module.courseId,
      creator: req.user.id
    });
    
    if (!course) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this module'
      });
    }
    
    // Update module
    if (title) module.title = title;
    if (description) module.description = description;
    if (order) module.order = order;
    
    await module.save();
    
    res.status(200).json({
      success: true,
      message: 'Module updated successfully',
      module
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete module
exports.deleteModule = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find module
    const module = await Module.findById(id);
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    // Check if course is owned by the creator
    const course = await Course.findOne({
      _id: module.courseId,
      creator: req.user.id
    });
    
    if (!course) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this module'
      });
    }
    
    // Check if course is published
    if (course.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete modules from published courses'
      });
    }
    
    // Delete all lessons in the module
    await Lesson.deleteMany({ moduleId: id });
    
    // Delete module
    await Module.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Module and all its lessons deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Add lesson to module
exports.addLesson = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { 
      title, 
      description, 
      type, 
      isPreview, 
      content 
    } = req.body;
    
    // Find module
    const module = await Module.findById(moduleId);
    
    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Module not found'
      });
    }
    
    // Check if course is owned by the creator
    const course = await Course.findOne({
      _id: module.courseId,
      creator: req.user.id
    });
    
    if (!course) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to add lessons to this module'
      });
    }
    
    // Get the highest order value to append the new lesson
    const lastLesson = await Lesson.findOne({ moduleId })
      .sort({ order: -1 });
    
    const order = lastLesson ? lastLesson.order + 1 : 1;
    
    // Create appropriate content based on lesson type
    let lessonContent = {};
    
    if (type === 'video') {
      lessonContent = {
        videoUrl: content.videoUrl || '',
        duration: content.duration || 0
      };
    } else if (type === 'text') {
      lessonContent = {
        htmlContent: content.htmlContent || ''
      };
    } else if (type === 'quiz') {
      lessonContent = {
        questions: content.questions || []
      };
    } else if (type === 'assignment') {
      lessonContent = {
        instructions: content.instructions || '',
        submissionType: content.submissionType || 'text'
      };
    }
    
    // Create lesson
    const lesson = await Lesson.create({
      moduleId,
      courseId: module.courseId,
      title,
      description,
      type,
      isPreview: !!isPreview,
      content: lessonContent,
      order
    });
    
    // Update course total lessons count
    await Course.findByIdAndUpdate(module.courseId, {
      $inc: { totalLessons: 1 }
    });
    
    // If video lesson with duration, update course total duration
    if (type === 'video' && content.duration) {
      await Course.findByIdAndUpdate(module.courseId, {
        $inc: { totalDuration: Math.ceil(content.duration / 60) } // Convert seconds to minutes
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Lesson added successfully',
      lesson
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update lesson
exports.updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      type, 
      isPreview, 
      content,
      order 
    } = req.body;
    
    // Find lesson
    const lesson = await Lesson.findById(id);
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    // Check if course is owned by the creator
    const course = await Course.findOne({
      _id: lesson.courseId,
      creator: req.user.id
    });
    
    if (!course) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this lesson'
      });
    }
    
    // Store old values for duration calculation
    const oldType = lesson.type;
    const oldDuration = lesson.type === 'video' ? lesson.content.duration || 0 : 0;
    
    // Update lesson fields
    if (title) lesson.title = title;
    if (description) lesson.description = description;
    if (order) lesson.order = order;
    
    // Update preview status
    if (isPreview !== undefined) {
      lesson.isPreview = !!isPreview;
    }
    
    // Update content based on lesson type
    if (type && content) {
      lesson.type = type;
      
      if (type === 'video') {
        lesson.content = {
          videoUrl: content.videoUrl || lesson.content.videoUrl || '',
          duration: content.duration || lesson.content.duration || 0
        };
      } else if (type === 'text') {
        lesson.content = {
          htmlContent: content.htmlContent || lesson.content.htmlContent || ''
        };
      } else if (type === 'quiz') {
        lesson.content = {
          questions: content.questions || lesson.content.questions || []
        };
      } else if (type === 'assignment') {
        lesson.content = {
          instructions: content.instructions || lesson.content.instructions || '',
          submissionType: content.submissionType || lesson.content.submissionType || 'text'
        };
      }
    } else if (content) {
      // Update content without changing type
      if (lesson.type === 'video') {
        if (content.videoUrl) lesson.content.videoUrl = content.videoUrl;
        if (content.duration) lesson.content.duration = content.duration;
      } else if (lesson.type === 'text') {
        if (content.htmlContent) lesson.content.htmlContent = content.htmlContent;
      } else if (lesson.type === 'quiz') {
        if (content.questions) lesson.content.questions = content.questions;
      } else if (lesson.type === 'assignment') {
        if (content.instructions) lesson.content.instructions = content.instructions;
        if (content.submissionType) lesson.content.submissionType = content.submissionType;
      }
    }
    
    await lesson.save();
    
    // Update course total duration if video duration changed
    if ((oldType === 'video' || lesson.type === 'video') && 
        (oldType !== lesson.type || oldDuration !== (lesson.content.duration || 0))) {
      
      // Calculate duration difference in minutes
      const oldMinutes = Math.ceil(oldDuration / 60);
      const newMinutes = lesson.type === 'video' ? Math.ceil((lesson.content.duration || 0) / 60) : 0;
      const durationDiff = newMinutes - oldMinutes;
      
      if (durationDiff !== 0) {
        await Course.findByIdAndUpdate(lesson.courseId, {
          $inc: { totalDuration: durationDiff }
        });
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Lesson updated successfully',
      lesson
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete lesson
exports.deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find lesson
    const lesson = await Lesson.findById(id);
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    // Check if course is owned by the creator
    const course = await Course.findOne({
      _id: lesson.courseId,
      creator: req.user.id
    });
    
    if (!course) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this lesson'
      });
    }
    
    // Check if course is published
    if (course.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete lessons from published courses'
      });
    }
    
    // Update course total lessons count
    await Course.findByIdAndUpdate(lesson.courseId, {
      $inc: { totalLessons: -1 }
    });
    
    // If video lesson, update course total duration
    if (lesson.type === 'video' && lesson.content.duration) {
      await Course.findByIdAndUpdate(lesson.courseId, {
        $inc: { totalDuration: -Math.ceil(lesson.content.duration / 60) } // Convert seconds to minutes
      });
    }
    
    // Delete lesson
    await Lesson.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Upload video for lesson
exports.uploadVideo = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find lesson
    const lesson = await Lesson.findById(id);
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    if (lesson.type !== 'video') {
      return res.status(400).json({
        success: false,
        message: 'This lesson is not a video lesson'
      });
    }
    
    // Check if course is owned by the creator
    const course = await Course.findOne({
      _id: lesson.courseId,
      creator: req.user.id
    });
    
    if (!course) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to upload video to this lesson'
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a video file'
      });
    }
    
    // Upload using our smart function
    const videoUrl = await uploadFile(req.file, 'course-videos');
    
    // Update lesson with video URL
    lesson.content.videoUrl = videoUrl;
    await lesson.save();
    
    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully',
      videoUrl
    });
  } catch (error) {
    console.error("Error uploading video:", error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload video'
    });
  }
};

// Publish course
exports.publishCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if course exists and is owned by the creator
    const course = await Course.findOne({
      _id: id,
      creator: req.user.id
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not have permission'
      });
    }
    
    // Check if course is already published
    if (course.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Course is already published'
      });
    }
    
    // Validate course has required fields
    if (!course.title || !course.description || !course.thumbnail || !course.category) {
      return res.status(400).json({
        success: false,
        message: 'Course must have title, description, thumbnail, and category'
      });
    }
    
    // Check if course has at least one module
    const moduleCount = await Module.countDocuments({ courseId: id });
    if (moduleCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Course must have at least one module'
      });
    }
    
    // Check if course has at least one lesson
    const lessonCount = await Lesson.countDocuments({ courseId: id });
    if (lessonCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'Course must have at least one lesson'
      });
    }
    
    // Publish course
    course.isPublished = true;
    course.publishedAt = Date.now();
    await course.save();
    
    res.status(200).json({
      success: true,
      message: 'Course published successfully. It will be reviewed by admin before becoming available.',
      course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get course statistics
exports.getCourseStats = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if course exists and is owned by the creator
    const course = await Course.findOne({
      _id: id,
      creator: req.user.id
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not have permission'
      });
    }
    
    // Get enrollment statistics
    const enrollmentCount = await Enrollment.countDocuments({ courseId: id });
    
    // Get revenue statistics
    const completedPayments = await Payment.find({ 
      courseId: id,
      status: 'completed'
    });
    
    const totalRevenue = completedPayments.reduce(
      (total, payment) => total + payment.creatorPayout,
      0
    );
    
    // Get monthly enrollments and revenue for the past 6 months
    const now = new Date();
    const sixMonthsAgo = new Date(now.setMonth(now.getMonth() - 6));
    
    const monthlyStats = [];
    for (let i = 0; i < 6; i++) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const month = monthDate.getMonth();
      const year = monthDate.getFullYear();
      
      // Filter enrollments for this month
      const monthEnrollments = await Enrollment.countDocuments({
        courseId: id,
        createdAt: {
          $gte: new Date(year, month, 1),
          $lt: new Date(year, month + 1, 1)
        }
      });
      
      // Filter payments for this month
      const monthPayments = completedPayments.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        return paymentDate.getMonth() === month && paymentDate.getFullYear() === year;
      });
      
      const monthlyRevenue = monthPayments.reduce(
        (total, payment) => total + payment.creatorPayout,
        0
      );
      
      monthlyStats.push({
        month: monthDate.toLocaleString('default', { month: 'long' }),
        year,
        enrollments: monthEnrollments,
        revenue: monthlyRevenue
      });
    }
    
    // Get lesson completion statistics
    const enrollments = await Enrollment.find({ courseId: id });
    
    const lessons = await Lesson.find({ courseId: id });
    const lessonCompletions = {};
    
    lessons.forEach(lesson => {
      lessonCompletions[lesson._id] = {
        title: lesson.title,
        completions: 0,
        completionRate: 0
      };
    });
    
    enrollments.forEach(enrollment => {
      enrollment.completedLessons.forEach(lessonId => {
        if (lessonCompletions[lessonId]) {
          lessonCompletions[lessonId].completions++;
        }
      });
    });
    
    // Calculate completion rates
    Object.keys(lessonCompletions).forEach(lessonId => {
      lessonCompletions[lessonId].completionRate = 
        (lessonCompletions[lessonId].completions / enrollmentCount) * 100 || 0;
    });
    
    res.status(200).json({
      success: true,
      enrollments: enrollmentCount,
      revenue: totalRevenue,
      monthlyStats: monthlyStats.reverse(), // Show oldest to newest
      lessonCompletions: Object.values(lessonCompletions)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get creator course details

exports.getCreatorCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if course exists and is owned by the creator
    const course = await Course.findOne({
      _id: id,
      creator: req.user.id
    }).populate('creator', 'fullName profileImage');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not have permission'
      });
    }
    
    // Get modules and lessons
    const modules = await Module.find({ courseId: id }).sort({ order: 1 });
    
    // Add lessons to each module
    const modulesWithLessons = await Promise.all(modules.map(async (module) => {
      const lessons = await Lesson.find({ moduleId: module._id }).sort({ order: 1 });
      return {
        ...module.toObject(),
        lessons: lessons
      };
    }));
    
    // Add modules to course object
    const courseWithModules = {
      ...course.toObject(),
      modules: modulesWithLessons
    };
    
    res.status(200).json({
      success: true,
      course: courseWithModules
    });
  } catch (error) {
    console.error("Error getting creator course:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Preview course for creator

exports.previewCreatorCourse = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Creator previewing course:', id);
    
    // Check if course exists and is owned by the creator
    const course = await Course.findOne({
      _id: id,
      creator: req.user.id
    }).populate('creator', 'fullName profileImage bio');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not have permission'
      });
    }
    
    // Get modules
    const modules = await Module.find({ courseId: id }).sort({ order: 1 });
    
    // Get all lessons for each module
    const modulesWithLessons = await Promise.all(modules.map(async (module) => {
      const lessons = await Lesson.find({ moduleId: module._id })
        .sort({ order: 1 });
      
      return {
        ...module.toObject(),
        lessons: lessons.map(lesson => ({
          _id: lesson._id,
          title: lesson.title,
          type: lesson.type,
          order: lesson.order,
          isPreview: lesson.isPreview,
          description: lesson.description
        }))
      };
    }));
    
    // Return the complete course with modules and lessons
    const courseData = {
      ...course.toObject(),
      modules: modulesWithLessons,
      isEnrolled: false,
      enrollment: null
    };
    
    res.status(200).json({
      success: true,
      course: courseData
    });
  } catch (error) {
    console.error("Error in previewCreatorCourse:", error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};