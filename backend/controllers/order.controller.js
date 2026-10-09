const crypto = require('crypto');
const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const razorpay = require('../config/razorpay');
const isValidId = require('../utils/isValidId');

// Checks the shipping address and returns { address } or { error }.
function validateShippingAddress(input) {
  if (!input || typeof input !== 'object') {
    return { error: 'Shipping address is required' };
  }

  const fields = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
  const address = {};

  for (const field of fields) {
    // trim() turns "   " into "" so whitespace-only values are rejected
    const value = typeof input[field] === 'string' ? input[field].trim() : '';
    if (!value) {
      return { error: `${field} is required` };
    }
    address[field] = value;
  }

  if (!/^[6-9]\d{9}$/.test(address.phone)) {
    return { error: 'Enter a valid 10-digit phone number' };
  }

  if (!/^\d{6}$/.test(address.pincode)) {
    return { error: 'Pincode must contain 6 digits' };
  }

  return { address };
}

// POST /orders/create-payment-order   body: { shippingAddress }
async function createPaymentOrder(req, res) {
  try {
    const { address, error } = validateShippingAddress(req.body.shippingAddress);
    if (error) {
      return res.status(400).json({ message: error });
    }

    if (!razorpay) {
      return res.status(500).json({ message: 'Payments are not configured on the server' });
    }

    // 1. the cart always comes from the database, never from the request body
    const cart = req.user.cart;
    if (cart.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    // 2. load the LATEST product data for everything in the cart (one query)
    const productIds = cart.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });

    // 3. check every item again + build the snapshot + calculate the total on the server
    const items = [];
    let totalAmount = 0;

    for (const cartItem of cart) {
      const product = products.find((p) => p._id.equals(cartItem.product));

      if (!product) {
        return res
          .status(400)
          .json({ message: 'A product in your cart is no longer available. Please remove it and try again.' });
      }

      if (product.stock < cartItem.quantity) {
        const message =
          product.stock === 0
            ? `${product.name} is out of stock. Please remove it from your cart.`
            : `Insufficient stock for ${product.name}. Only ${product.stock} left.`;
        return res.status(400).json({ message });
      }

      items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image
      });

      totalAmount += product.price * cartItem.quantity;
    }

    // 4. save a PENDING ShopKart order (the cart is NOT touched yet)
    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress: address,
      totalAmount
    });

    // 5. create the Razorpay order. Razorpay wants the amount in paise (₹1 = 100 paise)
    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
        receipt: order._id.toString()
      });
    } catch (err) {
      console.error('Razorpay order creation failed:', err.error || err.message);
      order.paymentStatus = 'FAILED';
      await order.save();
      return res.status(502).json({ message: 'Could not start the payment. Please try again.' });
    }

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    // 6. only safe data goes back. The Key ID is public, the Key Secret never leaves the server.
    return res.status(201).json({
      success: true,
      shopKartOrderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /orders/verify-payment
// body: { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature }
async function verifyPayment(req, res) {
  try {
    const { shopKartOrderId, razorpay_payment_id, razorpay_signature } = req.body;

    if (!shopKartOrderId || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Payment details are missing' });
    }

    if (!isValidId(shopKartOrderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    // the order must belong to the logged-in user
    const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // already verified before (e.g. the request was sent twice) -> just return it
    if (order.paymentStatus === 'PAID') {
      return res.json({ success: true, message: 'Payment already verified', order });
    }

    if (!order.razorpayOrderId) {
      return res.status(400).json({ message: 'This order has no payment started' });
    }

    // Recreate the signature ourselves using the Razorpay order id from OUR database
    // (not the one sent by the browser) and our secret key.
    const body = order.razorpayOrderId + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // order stays PENDING and the cart is NOT cleared
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Mark it paid. The filter makes sure this only happens once, even if two requests arrive together.
    const paidOrder = await Order.findOneAndUpdate(
      { _id: order._id, paymentStatus: { $ne: 'PAID' } },
      {
        paymentStatus: 'PAID',
        status: 'PLACED',
        razorpayPaymentId: razorpay_payment_id
      },
      { new: true }
    );

    if (!paidOrder) {
      const existing = await Order.findById(order._id);
      return res.json({ success: true, message: 'Payment already verified', order: existing });
    }

    // reduce stock for every item bought (never below 0)
    await Promise.all(
      paidOrder.items.map((item) =>
        Product.updateOne(
          { _id: item.product, stock: { $gte: item.quantity } },
          { $inc: { stock: -item.quantity } }
        )
      )
    );

    // only now, after the payment is verified, empty the cart
    await Customer.updateOne({ _id: req.user._id }, { $set: { cart: [] } });

    return res.json({ success: true, message: 'Payment verified. Order placed!', order: paidOrder });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}

// GET /orders   -> the logged-in user's placed orders, newest first
async function getMyOrders(req, res) {
  try {
    // unpaid checkout attempts are not real orders, so only paid ones are listed
    const orders = await Order.find({ user: req.user._id, paymentStatus: 'PAID' }).sort({ createdAt: -1 });

    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}

// GET /orders/:id
async function getOrderById(req, res) {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    // searching by id AND user means someone else's order is simply "not found"
    const order = await Order.findOne({ _id: id, user: req.user._id });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}

// PATCH /orders/:id/status   (development/admin only)   body: { status }
// Moves a paid order one step forward: PLACED -> CONFIRMED -> SHIPPED -> DELIVERED
const STATUS_FLOW = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    if (!STATUS_FLOW.includes(status)) {
      return res.status(400).json({ message: `Status must be one of ${STATUS_FLOW.join(', ')}` });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentStatus !== 'PAID') {
      return res.status(400).json({ message: 'Only paid orders can be updated' });
    }

    const currentStep = STATUS_FLOW.indexOf(order.status);
    const nextStep = STATUS_FLOW.indexOf(status);

    if (nextStep !== currentStep + 1) {
      return res.status(400).json({ message: `Order is ${order.status}, it can only move to the next step` });
    }

    order.status = status;
    await order.save();

    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus
};
