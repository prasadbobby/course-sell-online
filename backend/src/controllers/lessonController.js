const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Enrollment = require('../models/Enrollment');

// Get lesson content
exports.getLesson = async (req, res) => {
  try {
    const { id } = req.params;
    
    const lesson = await Lesson.findById(id);
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    // Check if the lesson is a preview
    if (lesson.isPreview) {
      return res.status(200).json({
        success: true,
        lesson
      });
    }
    
    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId: lesson.courseId
    });
    
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You need to be enrolled to access this lesson'
      });
    }
    
    // Update last accessed lesson
    enrollment.lastAccessedLesson = lesson._id;
    enrollment.lastAccessedAt = Date.now();
    await enrollment.save();
    
    res.status(200).json({
      success: true,
      lesson,
      enrollment: {
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark lesson as complete
exports.completeLesson = async (req, res) => {
  try {
    const { id } = req.params;
    
    const lesson = await Lesson.findById(id);
    
    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Lesson not found'
      });
    }
    
    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId: lesson.courseId
    });
    
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You need to be enrolled to complete this lesson'
      });
    }
    
    // Add to completed lessons if not already completed
    if (!enrollment.completedLessons.includes(lesson._id)) {
      enrollment.completedLessons.push(lesson._id);
      
      // Get total lesson count for progress calculation
      const totalLessons = await Lesson.countDocuments({ 
        courseId: lesson.courseId 
      });
      
      // Calculate progress
      enrollment.progress = (enrollment.completedLessons.length / totalLessons) * 100;
      
      await enrollment.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Lesson marked as complete',
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Submit quiz answer
exports.submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    
    const lesson = await Lesson.findById(id);
    
    if (!lesson || lesson.type !== 'quiz') {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }
    
    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId: lesson.courseId
    });
    
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You need to be enrolled to submit this quiz'
      });
    }
    
    // Grade the quiz
    const questions = lesson.content.questions;
    let correctAnswers = 0;
    
    if (!Array.isArray(answers) || answers.length !== questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid answers format'
      });
    }
    
    const results = questions.map((question, index) => {
      const isCorrect = answers[index] === question.correctOption;
      if (isCorrect) correctAnswers++;
      
      return {
        question: question.question,
        userAnswer: answers[index],
        correctAnswer: question.correctOption,
        isCorrect
      };
    });
    
    const score = (correctAnswers / questions.length) * 100;
    
    // Save quiz attempt
    const quizAttempt = {
      lessonId: lesson._id,
      date: Date.now(),
      score,
      answers: results
    };
    
    if (!enrollment.quizAttempts) {
      enrollment.quizAttempts = [];
    }
    
    enrollment.quizAttempts.push(quizAttempt);
    
    // Mark as completed if score is above passing (usually 60%)
    if (score >= 60 && !enrollment.completedLessons.includes(lesson._id)) {
      enrollment.completedLessons.push(lesson._id);
      
      // Get total lesson count for progress calculation
      const totalLessons = await Lesson.countDocuments({ 
        courseId: lesson.courseId 
      });
      
      // Calculate progress
      enrollment.progress = (enrollment.completedLessons.length / totalLessons) * 100;
    }
    
    await enrollment.save();
    
    res.status(200).json({
      success: true,
      score,
      results,
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Submit assignment
exports.submitAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { submission, submissionType } = req.body;
    
    const lesson = await Lesson.findById(id);
    
    if (!lesson || lesson.type !== 'assignment') {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }
    
    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId: lesson.courseId
    });
    
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You need to be enrolled to submit this assignment'
      });
    }
    
    // Save assignment submission
    const assignmentSubmission = {
      lessonId: lesson._id,
      date: Date.now(),
      submissionType,
      content: submission,
      feedback: '',
      status: 'submitted' // submitted, reviewed, approved
    };
    
    if (!enrollment.assignmentSubmissions) {
      enrollment.assignmentSubmissions = [];
    }
    
    enrollment.assignmentSubmissions.push(assignmentSubmission);
    await enrollment.save();
    
    res.status(200).json({
      success: true,
      message: 'Assignment submitted successfully',
      assignmentSubmission
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get progress for a course
exports.getLessonProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId
    });
    
    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You need to be enrolled to view progress'
      });
    }
    
    // Get all lessons for the course
    const lessons = await Lesson.find({ courseId })
      .select('_id title moduleId order type');
    
    // Get modules for structure
    const modules = await Module.find({ courseId })
      .select('_id title order')
      .sort({ order: 1 });
    
    // Structure the progress data
    const progressData = modules.map(module => {
      const moduleLessons = lessons
        .filter(lesson => lesson.moduleId.toString() === module._id.toString())
        .sort((a, b) => a.order - b.order)
        .map(lesson => ({
          _id: lesson._id,
          title: lesson.title,
          type: lesson.type,
          order: lesson.order,
          completed: enrollment.completedLessons.includes(lesson._id)
        }));
      
      return {
        _id: module._id,
        title: module.title,
        order: module.order,
        lessons: moduleLessons,
        progress: moduleLessons.length > 0 
          ? (moduleLessons.filter(l => l.completed).length / moduleLessons.length) * 100 
          : 0
      };
    });
    
    res.status(200).json({
      success: true,
      progress: enrollment.progress,
      lastAccessedLesson: enrollment.lastAccessedLesson,
      modules: progressData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};