const Order = require('../models/Order');
const Product = require('../models/Product');
const Settings = require('../models/Settings');

// Helper: validate and calculate order totals server-side
const validateCartItems = async (items) => {
  const validatedItems = [];
  let subtotal = 0;

  for (const item of items) {
    const product = await Product.findById(item.productId).populate('category', 'name');
    if (!product || !product.isActive || product.isDeleted) {
      throw new Error(`Product "${item.productId}" is not available.`);
    }

    let unitPrice = product.price;
    let planName = '';
    let planDuration = product.duration || '';

    if (item.planId && product.plans && product.plans.length > 0) {
      const plan = product.plans.id(item.planId);
      if (!plan) {
        throw new Error(`Plan not found for product "${product.name}".`);
      }
      unitPrice = plan.price;
      planName = plan.name;
      planDuration = plan.duration || planDuration;
    }

    const qty = parseInt(item.quantity) || 1;
    const totalPrice = parseFloat((unitPrice * qty).toFixed(2));
    subtotal += totalPrice;

    validatedItems.push({
      product: product._id,
      productSnapshot: {
        name: product.name,
        slug: product.slug,
        thumbnail: product.thumbnail,
        category: product.category?.name || ''
      },
      plan: { name: planName, duration: planDuration },
      quantity: qty,
      unitPrice,
      originalUnitPrice: product.originalPrice || unitPrice,
      totalPrice
    });
  }

  return { validatedItems, subtotal: parseFloat(subtotal.toFixed(2)) };
};

// @desc  Create order
// @route POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { items, customerInfo, paymentMethod, customerNotes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item.' });
    }

    const { validatedItems, subtotal } = await validateCartItems(items);
    const total = parseFloat((subtotal).toFixed(2));

    const order = await Order.create({
      customer: req.user?._id,
      customerInfo,
      items: validatedItems,
      subtotal,
      discountAmount: 0,
      total,
      currency: 'USD',
      paymentMethod,
      paymentStatus: paymentMethod === 'whatsapp' ? 'pending' : 'pending',
      orderStatus: 'pending',
      customerNotes,
      statusTimeline: [{
        status: 'pending',
        message: 'Order placed successfully.',
        timestamp: new Date()
      }]
    });

    // Update product order counts
    for (const item of validatedItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { orderCount: item.quantity } });
    }

    const populated = await Order.findById(order._id)
      .populate('items.product', 'name slug thumbnail');

    res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      data: populated
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create order.' });
  }
};

// @desc  Get order by ID or orderId
// @route GET /api/orders/:id
const getOrder = async (req, res) => {
  try {
    let order = await Order.findOne({
      $or: [
        { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
        { orderId: req.params.id }
      ],
      isDeleted: false
    }).populate('items.product', 'name slug thumbnail');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // If logged in, only allow own orders
    if (req.user && order.customer && order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order.' });
  }
};

// @desc  Get user's orders
// @route GET /api/orders/my-orders
const getMyOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({
        $or: [
          { customer: req.user._id },
          { 'customerInfo.email': req.user.email }
        ],
        isDeleted: false
      })
        .populate('items.product', 'name slug thumbnail')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Order.countDocuments({
        $or: [
          { customer: req.user._id },
          { 'customerInfo.email': req.user.email }
        ],
        isDeleted: false
      })
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

// =================== ADMIN ===================

// @desc  Admin: Get all orders
// @route GET /api/admin/orders
const adminGetOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { isDeleted: false };
    if (req.query.paymentStatus) query.paymentStatus = req.query.paymentStatus;
    if (req.query.orderStatus) query.orderStatus = req.query.orderStatus;
    if (req.query.paymentMethod) query.paymentMethod = req.query.paymentMethod;
    if (req.query.search) {
      query.$or = [
        { orderId: { $regex: req.query.search, $options: 'i' } },
        { 'customerInfo.fullName': { $regex: req.query.search, $options: 'i' } },
        { 'customerInfo.email': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('items.product', 'name thumbnail')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Order.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

// @desc  Admin: Get single order
// @route GET /api/admin/orders/:id
const adminGetOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [
        { _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null },
        { orderId: req.params.id }
      ]
    }).populate('items.product customer', 'name slug thumbnail firstName lastName email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch order.' });
  }
};

// @desc  Admin: Update order status
// @route PATCH /api/admin/orders/:id/status
const adminUpdateOrderStatus = async (req, res) => {
  const { orderStatus, paymentStatus, adminNotes, deliveryDetails } = req.body;

  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    const updates = {};
    if (orderStatus) updates.orderStatus = orderStatus;
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    if (adminNotes !== undefined) updates.adminNotes = adminNotes;
    if (deliveryDetails !== undefined) updates.deliveryDetails = deliveryDetails;

    const timelineEntry = {
      status: orderStatus || order.orderStatus,
      message: adminNotes || `Status updated to ${orderStatus || order.orderStatus}`,
      timestamp: new Date(),
      updatedBy: req.admin.name
    };

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        ...updates,
        $push: { statusTimeline: timelineEntry }
      },
      { new: true }
    ).populate('items.product', 'name thumbnail');

    res.json({ success: true, message: 'Order updated successfully.', data: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update order.' });
  }
};

// @desc  Admin: Dashboard stats
// @route GET /api/admin/dashboard
const adminGetDashboard = async (req, res) => {
  try {
    const [
      totalOrders, pendingOrders, processingOrders, completedOrders, cancelledOrders,
      totalProducts, activeProducts, totalCustomers,
      revenueData
    ] = await Promise.all([
      Order.countDocuments({ isDeleted: false }),
      Order.countDocuments({ orderStatus: 'pending', isDeleted: false }),
      Order.countDocuments({ orderStatus: 'processing', isDeleted: false }),
      Order.countDocuments({ orderStatus: 'completed', isDeleted: false }),
      Order.countDocuments({ orderStatus: 'cancelled', isDeleted: false }),
      require('../models/Product').countDocuments({ isDeleted: false }),
      require('../models/Product').countDocuments({ isActive: true, isDeleted: false }),
      require('../models/User').countDocuments({ isActive: true }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid', isDeleted: false } },
        { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
      ])
    ]);

    const totalRevenue = revenueData[0]?.total || 0;
    const paidOrders = revenueData[0]?.count || 0;

    // Orders over time (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const ordersOverTime = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo }, isDeleted: false } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Top products
    const topProducts = await Order.aggregate([
      { $match: { isDeleted: false } },
      { $unwind: '$items' },
      { $group: { _id: '$items.product', name: { $first: '$items.productSnapshot.name' }, orders: { $sum: '$items.quantity' }, revenue: { $sum: '$items.totalPrice' } } },
      { $sort: { orders: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalOrders, pendingOrders, processingOrders, completedOrders, cancelledOrders,
          totalProducts, activeProducts, totalCustomers,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          paidOrders
        },
        ordersOverTime,
        topProducts
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to load dashboard data.' });
  }
};

module.exports = {
  createOrder, getOrder, getMyOrders,
  adminGetOrders, adminGetOrder, adminUpdateOrderStatus, adminGetDashboard
};
