const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const isValidId = require('../utils/isValidId');

// Fills in product details for every cart row and returns the cart.
// If a product was deleted from the catalogue, its row is removed from the cart.
async function getPopulatedCart(customer) {
  const productIds = customer.cart.map((item) => item.product.toString());

  await customer.populate({
    path: 'cart.product',
    select: 'name price category image stock'
  });

  // after populate, a deleted product shows up as null
  const missingIds = productIds.filter((id, index) => !customer.cart[index].product);

  if (missingIds.length > 0) {
    await Customer.updateOne(
      { _id: customer._id },
      { $pull: { cart: { product: { $in: missingIds } } } }
    );
  }

  return customer.cart.filter((item) => item.product);
}

// GET /cart
async function getCart(req, res) {
  try {
    // req.user is the logged-in customer (set by authMiddleware)
    const cart = await getPopulatedCart(req.user);

    return res.json({ success: true, cart });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /cart/:productId  -> add 1 (new row with quantity 1, or +1 on the existing row)
async function addToCart(req, res) {
  try {
    const { productId } = req.params;

    if (!isValidId(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(productId).select('stock');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.stock < 1) {
      return res.status(400).json({ message: 'Product is out of stock' });
    }

    // 1. Not in the cart yet -> add a new row with quantity 1.
    //    The filter only matches if no row has this product, so we never get duplicate rows.
    let customer = await Customer.findOneAndUpdate(
      { _id: req.user._id, 'cart.product': { $ne: productId } },
      { $push: { cart: { product: productId, quantity: 1 } } },
      { new: true }
    ).select('cart');

    // 2. Already in the cart -> increase that row by 1,
    //    but only if the current quantity is still below the stock.
    if (!customer) {
      customer = await Customer.findOneAndUpdate(
        {
          _id: req.user._id,
          cart: { $elemMatch: { product: productId, quantity: { $lt: product.stock } } }
        },
        { $inc: { 'cart.$.quantity': 1 } }, // $ = the row that matched in the filter
        { new: true }
      ).select('cart');
    }

    // 3. Neither worked -> the cart already has as many as the stock allows
    if (!customer) {
      return res.status(400).json({ message: `Only ${product.stock} in stock` });
    }

    const cart = await getPopulatedCart(customer);
    return res.json({ success: true, message: 'Cart updated', cart });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}

// PATCH /cart/:productId  body: { "quantity": 3 }
async function updateCartQuantity(req, res) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!isValidId(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    if (!Number.isInteger(quantity)) {
      return res.status(400).json({ message: 'Quantity must be a whole number' });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(productId).select('stock');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (quantity > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} in stock` });
    }

    // only matches if this product is already in the cart, then sets that row's quantity
    const customer = await Customer.findOneAndUpdate(
      { _id: req.user._id, 'cart.product': productId },
      { $set: { 'cart.$.quantity': quantity } },
      { new: true }
    ).select('cart');

    if (!customer) {
      return res.status(404).json({ message: 'Product not in cart' });
    }

    const cart = await getPopulatedCart(customer);
    return res.json({ success: true, message: 'Cart updated', cart });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /cart/:productId
async function removeFromCart(req, res) {
  try {
    const { productId } = req.params;

    if (!isValidId(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // only matches if the product is in the cart, then $pull removes that row
    const customer = await Customer.findOneAndUpdate(
      { _id: req.user._id, 'cart.product': productId },
      { $pull: { cart: { product: productId } } },
      { new: true }
    ).select('cart');

    if (!customer) {
      return res.status(404).json({ message: 'Product not in cart' });
    }

    const cart = await getPopulatedCart(customer);
    return res.json({ success: true, message: 'Product removed from cart', cart });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart
};
