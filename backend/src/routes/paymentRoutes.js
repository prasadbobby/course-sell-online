const express = require('express');
const { 
  createOrder, 
  verifyPayment, 
  requestRefund
} = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(authenticate);

router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/refund', requestRefund);

module.exports = router;