const express = require('express');
const {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/order.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const adminKeyMiddleware = require('../middlewares/adminKey.middleware');

const router = express.Router();

router.post('/create-payment-order', authMiddleware, createPaymentOrder);
router.post('/verify-payment', authMiddleware, verifyPayment);
router.get('/', authMiddleware, getMyOrders);
router.get('/:id', authMiddleware, getOrderById);

// development/admin only: move an order to the next status
router.patch('/:id/status', adminKeyMiddleware, updateOrderStatus);

module.exports = router;
