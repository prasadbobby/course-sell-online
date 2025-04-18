const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const { uploadToS3 } = require('../middleware/fileUpload');

// Get all published and approved courses
exports.getCourses = async (req, res) => {
  try {
    const { 
      category, 
      level, 
      price, 
      search,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;
    
    // Build query
    const query = {
      isPublished: true,
      isApproved: true
    };
    
    // Add filters
    if (category) query.category = category;
    if (level) query.level = level;
    if (price) {
      if (price === 'free') {
        query.price = 0;
      } else if (price === 'paid') {
        query.price = { $gt: 0 };
      }
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    // Sorting
    let sortOption = {};
    if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'price-low') {
      sortOption = { price: 1 };
    } else if (sort === 'price-high') {
      sortOption = { price: -1 };
    } else if (sort === 'popular') {
      sortOption = { enrolledStudents: -1 };
    } else if (sort === 'rating') {
      sortOption = { 'rating.average': -1 };
    }
    
    // Pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Execute query
    const courses = await Course.find(query)
      .populate('creator', 'fullName profileImage')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);
    
    // Get total count
    const total = await Course.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: courses.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get course by ID
exports.getCourse = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting course by ID:', id);
    
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format'
      });
    }
    
    const course = await Course.findById(id)
      .populate('creator', 'fullName profileImage bio socialLinks');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Get modules
    const modules = await Module.find({ courseId: id }).sort({ order: 1 });
    
    // Get lessons for each module
    const modulesWithLessons = await Promise.all(modules.map(async (module) => {
      const lessons = await Lesson.find({ 
        moduleId: module._id 
      }).sort({ order: 1 }).select('title description type isPreview order');
      
      return {
        ...module.toObject(),
        lessons
      };
    }));
    
    // Check if user is enrolled
    let isEnrolled = false;
    let enrollment = null;
    
    if (req.user) {
      enrollment = await Enrollment.findOne({
        userId: req.user.id,
        courseId: id
      });
      
      isEnrolled = !!enrollment;
    }
    
    // Prepare course data
    const courseData = {
      ...course.toObject(),
      modules: modulesWithLessons,
      isEnrolled,
      enrollment: isEnrolled ? {
        progress: enrollment.progress,
        lastAccessedLesson: enrollment.lastAccessedLesson,
        completedLessons: enrollment.completedLessons
      } : null
    };
    
    res.status(200).json({
      success: true,
      course: courseData
    });
  } catch (error) {
    console.error("Error in getCourse:", error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

exports.getCoursePreview = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Getting course preview for ID:', id);
    
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID format'
      });
    }
    
    const course = await Course.findById(id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Populate creator info
    await course.populate('creator', 'fullName profileImage bio');
    
    // Get modules
    const modules = await Module.find({ courseId: id }).sort({ order: 1 });
    
    // Get preview lessons
    const modulesWithLessons = await Promise.all(modules.map(async (module) => {
      const lessons = await Lesson.find({
        moduleId: module._id,
      }).sort({ order: 1 }).select('title type isPreview order');
      
      return {
        _id: module._id,
        title: module.title,
        description: module.description,
        order: module.order,
        lessons: lessons.map(lesson => ({
          _id: lesson._id,
          title: lesson.title,
          type: lesson.type,
          order: lesson.order,
          isPreview: lesson.isPreview
        }))
      };
    }));
    
    // Prepare the course data
    const courseData = {
      _id: course._id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      price: course.price,
      discountPrice: course.discountPrice,
      discountValidUntil: course.discountValidUntil,
      level: course.level,
      category: course.category,
      rating: course.rating,
      enrolledStudents: course.enrolledStudents,
      creator: course.creator,
      whatYouWillLearn: course.whatYouWillLearn || [],
      requirements: course.requirements || [],
      totalDuration: course.totalDuration,
      totalLessons: course.totalLessons,
      modules: modulesWithLessons
    };
    
    res.status(200).json({
      success: true,
      course: courseData
    });
  } catch (error) {
    console.error("Error in getCoursePreview:", error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// Enroll in a course (free courses)
exports.enrollCourse = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if course exists and is free
    const course = await Course.findOne({
      _id: id,
      price: 0,
      isPublished: true,
      isApproved: true
    });
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Free course not found'
      });
    }
    
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId: id
    });
    
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }
    
    // Create enrollment
    const enrollment = await Enrollment.create({
      userId: req.user.id,
      courseId: id,
      enrollmentDate: Date.now()
    });
    
    // Update course enrolled students count
    await Course.findByIdAndUpdate(id, {
      $inc: { enrolledStudents: 1 }
    });
    
    res.status(200).json({
      success: true,
      message: 'Successfully enrolled in the course',
      enrollment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get categories
exports.getCategories = async (req, res) => {
  try {
    // Get distinct categories from all courses
    const categories = await Course.distinct('category', { 
      isPublished: true,
      isApproved: true
    });
    
    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Rate course
exports.rateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating should be between 1 and 5'
      });
    }
    
    // Check if course exists
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId: id
    });
    
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You need to be enrolled in the course to rate it'
      });
    }
    
    // Create or update rating
    const existingRating = await Rating.findOne({
      userId: req.user.id,
      courseId: id
    });
    
    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review;
      await existingRating.save();
    } else {
      await Rating.create({
        userId: req.user.id,
        courseId: id,
        rating,
        review
      });
    }
    
    // Update course rating
    const allRatings = await Rating.find({ courseId: id });
    const avgRating = allRatings.reduce((acc, curr) => acc + curr.rating, 0) / allRatings.length;
    
    await Course.findByIdAndUpdate(id, {
      'rating.average': avgRating,
      'rating.count': allRatings.length
    });
    
    res.status(200).json({
      success: true,
      message: 'Course rated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};