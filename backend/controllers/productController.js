const Product = require('../models/Product');
const Category = require('../models/Category');

const mongoose = require('mongoose');

// Helper: Build query
const buildProductQuery = async (queryParams) => {
  const { category, minPrice, maxPrice, featured, stockStatus, tags } = queryParams;
  const query = { isActive: true, isDeleted: false };

  if (category) {
    if (mongoose.Types.ObjectId.isValid(category) && String(new mongoose.Types.ObjectId(category)) === category) {
      query.category = category;
    } else {
      const foundCat = await Category.findOne({ slug: category });
      if (foundCat) {
        query.category = foundCat._id;
      } else {
        query.category = new mongoose.Types.ObjectId();
      }
    }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined && minPrice !== '') query.price.$gte = parseFloat(minPrice);
    if (maxPrice !== undefined && maxPrice !== '') query.price.$lte = parseFloat(maxPrice);
    if (Object.keys(query.price).length === 0) delete query.price;
  }

  if (featured === 'true') query.isFeatured = true;
  if (stockStatus) query.stockStatus = stockStatus;

  if (tags) {
    query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
  }

  return query;
};

// @desc  Get all products
// @route GET /api/products
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    const sort = req.query.sort || '-createdAt';
    const validSorts = ['price', '-price', 'createdAt', '-createdAt', 'name', '-name', 'orderCount', '-orderCount'];
    const sortKey = validSorts.includes(sort) ? sort : '-createdAt';

    let query = await buildProductQuery(req.query);

    // Text / Regex search
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { shortDescription: { $regex: req.query.search, $options: 'i' } },
        { tags: { $in: [new RegExp(req.query.search, 'i')] } }
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug icon color')
        .select('-description -faq')
        .sort(sortKey)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
};

// @desc  Get featured products
// @route GET /api/products/featured
const getFeaturedProducts = async (req, res) => {
  try {
    let products = await Product.find({ isActive: true, isDeleted: false, isFeatured: true })
      .populate('category', 'name slug icon color')
      .select('-description -faq')
      .sort('-createdAt')
      .limit(12);

    // Fallback: if fewer than 8 featured products, fill with active products so products always display
    if (products.length < 8) {
      const more = await Product.find({
        isActive: true,
        isDeleted: false,
        _id: { $nin: products.map(p => p._id) }
      })
        .populate('category', 'name slug icon color')
        .select('-description -faq')
        .sort('-createdAt')
        .limit(12 - products.length);
      products = [...products, ...more];
    }

    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch featured products.' });
  }
};

// @desc  Get single product by slug
// @route GET /api/products/:slug
const getProductBySlug = async (req, res) => {
  try {
    let query = { slug: req.params.slug, isDeleted: false };
    if (mongoose.Types.ObjectId.isValid(req.params.slug)) {
      query = {
        $or: [{ slug: req.params.slug }, { _id: req.params.slug }],
        isDeleted: false
      };
    }
    const product = await Product.findOne(query).populate('category', 'name slug icon color');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    // Increment view count
    await Product.findByIdAndUpdate(product._id, { $inc: { viewCount: 1 } });

    // Fetch related products
    const related = await Product.find({
      category: product.category._id,
      isActive: true,
      isDeleted: false,
      _id: { $ne: product._id }
    })
      .populate('category', 'name slug')
      .select('-description -faq')
      .limit(6);

    res.json({ success: true, data: product, related });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product.' });
  }
};

// @desc  Search products
// @route GET /api/products/search
const searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters.' });
    }

    const products = await Product.find({
      isActive: true,
      isDeleted: false,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { shortDescription: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    })
      .populate('category', 'name slug')
      .select('name slug shortDescription price originalPrice thumbnail category isFeatured stockStatus')
      .limit(20);

    res.json({ success: true, data: products, count: products.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Search failed.' });
  }
};

// =================== ADMIN ===================

// @desc  Admin: Get all products
// @route GET /api/admin/products
const adminGetProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { isDeleted: false };
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { slug: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    if (req.query.category) query.category = req.query.category;
    if (req.query.isActive !== undefined) query.isActive = req.query.isActive === 'true';
    if (req.query.isFeatured !== undefined) query.isFeatured = req.query.isFeatured === 'true';

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(req.query.sort || '-createdAt')
        .skip(skip)
        .limit(limit),
      Product.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
};

// @desc  Admin: Get single product by id or slug
// @route GET /api/admin/products/:id
const adminGetProduct = async (req, res) => {
  try {
    let product = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      product = await Product.findOne({ _id: req.params.id, isDeleted: false })
        .populate('category', 'name slug icon color');
    }
    if (!product) {
      product = await Product.findOne({ slug: req.params.id, isDeleted: false })
        .populate('category', 'name slug icon color');
    }

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    console.error('Admin get product error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product.' });
  }
};

// @desc  Admin: Create product
// @route POST /api/admin/products
const adminCreateProduct = async (req, res) => {
  try {
    const productData = { ...req.body };

    // Parse JSON strings if sent as form data
    if (typeof productData.plans === 'string') {
      try { productData.plans = JSON.parse(productData.plans); } catch {}
    }
    if (typeof productData.features === 'string') {
      try { productData.features = JSON.parse(productData.features); } catch {}
    }
    if (typeof productData.tags === 'string') {
      try { productData.tags = JSON.parse(productData.tags); } catch {}
    }
    if (typeof productData.faq === 'string') {
      try { productData.faq = JSON.parse(productData.faq); } catch {}
    }

    const product = await Product.create(productData);
    const populated = await product.populate('category', 'name slug');

    res.status(201).json({ success: true, message: 'Product created successfully.', data: populated });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A product with this slug already exists.' });
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to create product.' });
  }
};

// @desc  Admin: Update product
// @route PUT /api/admin/products/:id
const adminUpdateProduct = async (req, res) => {
  try {
    const productData = { ...req.body };
    delete productData._id;
    delete productData.__v;

    if (productData.category && typeof productData.category === 'object' && productData.category._id) {
      productData.category = productData.category._id;
    }

    if (typeof productData.plans === 'string') {
      try { productData.plans = JSON.parse(productData.plans); } catch {}
    }
    if (typeof productData.features === 'string') {
      try { productData.features = JSON.parse(productData.features); } catch {}
    }
    if (typeof productData.tags === 'string') {
      try { productData.tags = JSON.parse(productData.tags); } catch {}
    }
    if (typeof productData.faq === 'string') {
      try { productData.faq = JSON.parse(productData.faq); } catch {}
    }

    // Keep single plan price synchronized with product base price
    if (productData.price !== undefined && Array.isArray(productData.plans) && productData.plans.length === 1) {
      productData.plans[0].price = parseFloat(productData.price);
      if (productData.originalPrice !== undefined) {
        productData.plans[0].originalPrice = parseFloat(productData.originalPrice);
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...productData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, message: 'Product updated successfully.', data: product });
  } catch (error) {
    console.error('Update product error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'A product with this slug already exists.' });
    }
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
};

// @desc  Admin: Delete product (soft delete)
// @route DELETE /api/admin/products/:id
const adminDeleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete product.' });
  }
};

// @desc  Admin: Toggle product active/inactive
// @route PATCH /api/admin/products/:id/toggle-active
const adminToggleActive = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      success: true,
      message: `Product ${product.isActive ? 'activated' : 'deactivated'}.`,
      data: { isActive: product.isActive }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
};

// @desc  Admin: Toggle product featured
// @route PATCH /api/admin/products/:id/toggle-featured
const adminToggleFeatured = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    product.isFeatured = !product.isFeatured;
    await product.save();

    res.json({
      success: true,
      message: `Product ${product.isFeatured ? 'featured' : 'unfeatured'}.`,
      data: { isFeatured: product.isFeatured }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
};

// @desc  Admin: Duplicate product
// @route POST /api/admin/products/:id/duplicate
const adminDuplicateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    delete product._id;
    delete product.__v;
    delete product.createdAt;
    delete product.updatedAt;

    product.name = `${product.name} (Copy)`;
    product.slug = `${product.slug}-copy-${Date.now()}`;
    product.isActive = false;
    product.orderCount = 0;
    product.viewCount = 0;

    const newProduct = await Product.create(product);
    const populated = await newProduct.populate('category', 'name slug');

    res.status(201).json({ success: true, message: 'Product duplicated.', data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to duplicate product.' });
  }
};

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProductBySlug,
  searchProducts,
  adminGetProducts,
  adminGetProduct,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminToggleActive,
  adminToggleFeatured,
  adminDuplicateProduct
};
