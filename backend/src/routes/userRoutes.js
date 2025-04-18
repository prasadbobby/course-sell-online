const express = require('express');
const { 
  updateProfile, 
  uploadProfileImage, 
  changePassword, 
  becomeCreator,
  getEnrolledCourses,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  updateCreatorApplication
} = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { upload } = require('../middleware/fileUpload');

const router = express.Router();

// All routes are protected
router.use(authenticate);

router.put('/me', updateProfile);
router.put('/me/password', changePassword);
router.post('/become-creator', becomeCreator);
router.post('/me/profile-image', upload.single('image'), uploadProfileImage);
router.get('/me/courses', getEnrolledCourses);
router.get('/me/wishlist', getWishlist);
router.post('/me/wishlist', addToWishlist);
router.delete('/me/wishlist/:courseId', removeFromWishlist);
router.post('/update-creator-application', updateCreatorApplication);

module.exports = router;