const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { adminProtect } = require('../middleware/adminAuth');
const path = require('path');

// @desc  Upload product image
// @route POST /api/upload/product
router.post('/product', adminProtect, (req, res, next) => {
  req.uploadFolder = 'products';
  next();
}, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  const folder = req.uploadFolder || 'products';
  const fileUrl = `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${folder}/${req.file.filename}`;

  res.json({
    success: true,
    message: 'Image uploaded successfully.',
    url: fileUrl,
    filename: req.file.filename
  });
});

// @desc  Upload multiple product images
// @route POST /api/upload/products
router.post('/products', adminProtect, (req, res, next) => {
  req.uploadFolder = 'products';
  next();
}, upload.array('images', 5), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No files uploaded.' });
  }

  const folder = req.uploadFolder || 'products';
  const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const urls = req.files.map(f => `${baseUrl}/uploads/${folder}/${f.filename}`);

  res.json({ success: true, message: 'Images uploaded.', urls });
});

// @desc  Upload settings image (logo etc)
// @route POST /api/upload/settings
router.post('/settings', adminProtect, (req, res, next) => {
  req.uploadFolder = 'settings';
  next();
}, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded.' });
  }

  const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  const fileUrl = `${baseUrl}/uploads/settings/${req.file.filename}`;

  res.json({ success: true, message: 'Image uploaded successfully.', url: fileUrl });
});

module.exports = router;
