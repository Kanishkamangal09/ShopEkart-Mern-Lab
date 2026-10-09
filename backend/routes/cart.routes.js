const express = require('express');
const {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart
} = require('../controllers/cart.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// every cart route needs a logged-in user
router.use(authMiddleware);

router.get('/', getCart);
router.post('/:productId', addToCart);
router.patch('/:productId', updateCartQuantity);
router.delete('/:productId', removeFromCart);

module.exports = router;
