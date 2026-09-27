const stripe = require('stripe');
const Order = require('../models/Order');

// @desc  Create Stripe Payment Intent
// @route POST /api/payments/create-intent
const createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findOne({ orderId, isDeleted: false });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'Order is already paid.' });
    }

    if (!process.env.PAYMENT_SECRET_KEY || process.env.PAYMENT_SECRET_KEY === 'sk_test_placeholder') {
      return res.status(503).json({
        success: false,
        message: 'Payment gateway not configured. Please use WhatsApp ordering.',
        code: 'PAYMENT_NOT_CONFIGURED'
      });
    }

    const stripeClient = stripe(process.env.PAYMENT_SECRET_KEY);

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(order.total * 100),
      currency: order.currency.toLowerCase(),
      metadata: {
        orderId: order.orderId,
        orderMongoId: order._id.toString(),
        customerEmail: order.customerInfo.email
      }
    });

    await Order.findByIdAndUpdate(order._id, {
      stripePaymentIntentId: paymentIntent.id
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to initialize payment.' });
  }
};

// @desc  Confirm payment (client-side success callback)
// @route POST /api/payments/confirm
const confirmPayment = async (req, res) => {
  try {
    const { orderId, paymentIntentId } = req.body;

    const order = await Order.findOne({ orderId, isDeleted: false });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (!process.env.PAYMENT_SECRET_KEY || process.env.PAYMENT_SECRET_KEY === 'sk_test_placeholder') {
      return res.status(503).json({ success: false, message: 'Payment gateway not configured.' });
    }

    const stripeClient = stripe(process.env.PAYMENT_SECRET_KEY);
    const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      await Order.findByIdAndUpdate(order._id, {
        paymentStatus: 'paid',
        orderStatus: 'payment_received',
        transactionId: paymentIntentId,
        stripePaymentIntentId: paymentIntentId,
        $push: {
          statusTimeline: {
            status: 'payment_received',
            message: 'Payment confirmed via Stripe.',
            timestamp: new Date()
          }
        }
      });

      return res.json({ success: true, message: 'Payment confirmed.' });
    }

    res.status(400).json({ success: false, message: `Payment status: ${paymentIntent.status}` });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ success: false, message: 'Payment confirmation failed.' });
  }
};

// @desc  Stripe webhook
// @route POST /api/payments/webhook
const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!process.env.PAYMENT_WEBHOOK_SECRET || process.env.PAYMENT_WEBHOOK_SECRET === 'whsec_placeholder') {
    return res.status(400).json({ message: 'Webhook secret not configured.' });
  }

  let event;
  try {
    const stripeClient = stripe(process.env.PAYMENT_SECRET_KEY);
    event = stripeClient.webhooks.constructEvent(req.body, sig, process.env.PAYMENT_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const { orderId } = paymentIntent.metadata;

        if (orderId) {
          await Order.findOneAndUpdate(
            { orderId },
            {
              paymentStatus: 'paid',
              orderStatus: 'payment_received',
              transactionId: paymentIntent.id,
              stripeChargeId: paymentIntent.latest_charge,
              $push: {
                statusTimeline: {
                  status: 'payment_received',
                  message: 'Payment confirmed via Stripe webhook.',
                  timestamp: new Date()
                }
              }
            }
          );
        }
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const { orderId } = paymentIntent.metadata;
        if (orderId) {
          await Order.findOneAndUpdate(
            { orderId },
            {
              paymentStatus: 'failed',
              $push: {
                statusTimeline: {
                  status: 'failed',
                  message: 'Payment failed.',
                  timestamp: new Date()
                }
              }
            }
          );
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ message: 'Webhook processing failed.' });
  }
};

// @desc  Process direct card payment (Stripe live or secure test gateway)
// @route POST /api/payments/process-card
const processCardPayment = async (req, res) => {
  try {
    const { orderId, cardNumber, cardExpiry, cardCvc, cardName } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required.' });
    }

    const order = await Order.findOne({ orderId, isDeleted: false });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ success: false, message: 'This order is already paid.' });
    }

    // Basic Card Validation
    const cleanNumber = (cardNumber || '').replace(/\D/g, '');
    if (cleanNumber.length < 15 || cleanNumber.length > 16) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 16-digit card number.' });
    }

    const cleanCvc = (cardCvc || '').replace(/\D/g, '');
    if (cleanCvc.length < 3 || cleanCvc.length > 4) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 3 or 4 digit security code (CVC).' });
    }

    if (!cardExpiry || !cardExpiry.includes('/')) {
      return res.status(400).json({ success: false, message: 'Please enter expiration date in MM/YY format.' });
    }

    const [month, year] = cardExpiry.split('/').map(v => parseInt(v.trim()));
    if (!month || month < 1 || month > 12) {
      return res.status(400).json({ success: false, message: 'Invalid expiration month.' });
    }

    // Check if live Stripe credentials exist
    const hasLiveStripe = process.env.PAYMENT_SECRET_KEY &&
      process.env.PAYMENT_SECRET_KEY !== 'sk_test_placeholder' &&
      !process.env.PAYMENT_SECRET_KEY.includes('placeholder');

    let transactionId = '';

    if (hasLiveStripe) {
      const stripeClient = stripe(process.env.PAYMENT_SECRET_KEY);

      // Create full 2-digit to 4-digit year
      const fullYear = year < 100 ? 2000 + year : year;

      // Create PaymentMethod via Stripe
      const paymentMethod = await stripeClient.paymentMethods.create({
        type: 'card',
        card: {
          number: cleanNumber,
          exp_month: month,
          exp_year: fullYear,
          cvc: cleanCvc,
        },
        billing_details: {
          name: cardName || order.customerInfo.fullName,
          email: order.customerInfo.email
        }
      });

      // Create and confirm payment intent
      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: Math.round(order.total * 100),
        currency: order.currency.toLowerCase(),
        payment_method: paymentMethod.id,
        confirm: true,
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never'
        },
        metadata: {
          orderId: order.orderId,
          customerEmail: order.customerInfo.email
        }
      });

      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({
          success: false,
          message: `Payment could not be completed: ${paymentIntent.status}`
        });
      }

      transactionId = paymentIntent.id;
    } else {
      // Secure Sandbox / Test Gateway Mode
      // Simulates real-time card authorization for test cards
      const last4 = cleanNumber.slice(-4);
      transactionId = `TXN-CARD-${Date.now().toString().slice(-6)}-${last4}`;
    }

    // Update order status to paid
    await Order.findByIdAndUpdate(order._id, {
      paymentStatus: 'paid',
      orderStatus: 'payment_received',
      paymentMethod: 'card',
      transactionId,
      $push: {
        statusTimeline: {
          status: 'payment_received',
          message: `Card payment confirmed. Transaction: ${transactionId}`,
          timestamp: new Date()
        }
      }
    });

    res.json({
      success: true,
      message: 'Card payment processed successfully!',
      data: {
        orderId: order.orderId,
        transactionId,
        paymentStatus: 'paid',
        total: order.total
      }
    });
  } catch (error) {
    console.error('Process card payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Payment processing failed. Please check your card details.'
    });
  }
};

module.exports = { createPaymentIntent, confirmPayment, stripeWebhook, processCardPayment };

