const express = require('express');
const router = express.Router();
const { createPaymentIntent, confirmPayment, stripeWebhook, processCardPayment } = require('../controllers/paymentController');
const { optionalAuth } = require('../middleware/auth');

router.post('/webhook', stripeWebhook);
router.post('/create-intent', optionalAuth, createPaymentIntent);
router.post('/confirm', optionalAuth, confirmPayment);
router.post('/process-card', optionalAuth, processCardPayment);

module.exports = router;

