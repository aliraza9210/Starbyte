const express = require('express');
const router = express.Router();
const { createOrder, getOrder, getMyOrders } = require('../controllers/orderController');
const { protect, optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, createOrder);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', optionalAuth, getOrder);

module.exports = router;
