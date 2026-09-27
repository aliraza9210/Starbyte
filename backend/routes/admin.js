const express = require('express');
const router = express.Router();
const { adminProtect } = require('../middleware/adminAuth');
const {
  adminGetProducts, adminGetProduct, adminCreateProduct, adminUpdateProduct,
  adminDeleteProduct, adminToggleActive, adminToggleFeatured, adminDuplicateProduct
} = require('../controllers/productController');
const {
  adminGetOrders, adminGetOrder, adminUpdateOrderStatus, adminGetDashboard
} = require('../controllers/orderController');
const {
  adminGetCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory
} = require('../controllers/categoryController');
const { adminGetSettings, adminUpdateSettings } = require('../controllers/settingsController');
const User = require('../models/User');

// All admin routes require adminProtect
router.use(adminProtect);

// Dashboard
router.get('/dashboard', adminGetDashboard);

// Products
router.get('/products', adminGetProducts);
router.get('/products/:id', adminGetProduct);
router.post('/products', adminCreateProduct);
router.put('/products/:id', adminUpdateProduct);
router.delete('/products/:id', adminDeleteProduct);
router.patch('/products/:id/toggle-active', adminToggleActive);
router.patch('/products/:id/toggle-featured', adminToggleFeatured);
router.post('/products/:id/duplicate', adminDuplicateProduct);

// Orders
router.get('/orders', adminGetOrders);
router.get('/orders/:id', adminGetOrder);
router.patch('/orders/:id/status', adminUpdateOrderStatus);

// Categories
router.get('/categories', adminGetCategories);
router.post('/categories', adminCreateCategory);
router.put('/categories/:id', adminUpdateCategory);
router.delete('/categories/:id', adminDeleteCategory);

// Customers
router.get('/customers', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    const query = {};
    if (req.query.search) {
      query.$or = [
        { firstName: { $regex: req.query.search, $options: 'i' } },
        { lastName: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    const [customers, total] = await Promise.all([
      User.find(query).select('-password').sort('-createdAt').skip(skip).limit(limit),
      User.countDocuments(query)
    ]);
    res.json({ success: true, data: customers, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch customers.' });
  }
});

// Settings
router.get('/settings', adminGetSettings);
router.put('/settings', adminUpdateSettings);

module.exports = router;
