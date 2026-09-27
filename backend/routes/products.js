const express = require('express');
const router = express.Router();
const {
  getProducts, getFeaturedProducts, getProductBySlug, searchProducts
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);
router.get('/:slug', getProductBySlug);

module.exports = router;
