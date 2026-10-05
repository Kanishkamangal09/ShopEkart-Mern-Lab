const Customer = require('../models/customer.model');
const Product = require('../models/product.model');
const isValidId = require('../utils/isValidId');

// GET /wishlist
async function getWishlist(req, res) {
  try {
    // req.user is the logged-in customer (set by authMiddleware).
    const savedIds = req.user.wishlist.map((id) => id.toString());

    // populate() replaces each Product id in the wishlist with the actual product data.
    await req.user.populate({
      path: 'wishlist',
      select: 'name price category image stock'
    });

    // If a product was deleted from the catalogue, populate() leaves it out.
    // Remove those leftover ids so the saved count stays correct.
    const foundIds = req.user.wishlist.map((product) => product._id.toString());
    const missingIds = savedIds.filter((id) => !foundIds.includes(id));

    if (missingIds.length > 0) {
      await Customer.updateOne({ _id: req.user._id }, { $pull: { wishlist: { $in: missingIds } } });
    }

    return res.json({
      success: true,
      count: req.user.wishlist.length,
      wishlist: req.user.wishlist
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}

// POST /wishlist/:productId
async function addToWishlist(req, res) {
  try {
    const { productId } = req.params;

    if (!isValidId(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Only update the customer if the product is NOT already in the wishlist ($ne = not equal).
    // Doing the check and the update in one query means even two fast clicks can't create a duplicate.
    const customer = await Customer.findOneAndUpdate(
      { _id: req.user._id, wishlist: { $ne: productId } },
      { $push: { wishlist: productId } },
      { new: true }
    ).select('wishlist');

    if (!customer) {
      return res.status(409).json({ message: 'Product already in wishlist' });
    }

    return res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
      count: customer.wishlist.length
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}

// DELETE /wishlist/:productId
async function removeFromWishlist(req, res) {
  try {
    const { productId } = req.params;

    if (!isValidId(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // Only matches if the product IS in the wishlist, then $pull removes it.
    const customer = await Customer.findOneAndUpdate(
      { _id: req.user._id, wishlist: productId },
      { $pull: { wishlist: productId } },
      { new: true }
    ).select('wishlist');

    if (!customer) {
      return res.status(404).json({ message: 'Product not in wishlist' });
    }

    return res.json({
      success: true,
      message: 'Product removed from wishlist',
      count: customer.wishlist.length
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}

// PATCH /wishlist/:productId/toggle  (bonus)
async function toggleWishlist(req, res) {
  try {
    const { productId } = req.params;

    if (!isValidId(productId)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    // 1. If it is already saved -> remove it
    const removed = await Customer.findOneAndUpdate(
      { _id: req.user._id, wishlist: productId },
      { $pull: { wishlist: productId } },
      { new: true }
    ).select('wishlist');

    if (removed) {
      return res.json({
        success: true,
        saved: false,
        message: 'Product removed from wishlist',
        count: removed.wishlist.length
      });
    }

    // 2. Otherwise -> add it (only if the product exists)
    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // $addToSet only adds the id if it is not already in the array
    const added = await Customer.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { wishlist: productId } },
      { new: true }
    ).select('wishlist');

    return res.json({
      success: true,
      saved: true,
      message: 'Product added to wishlist',
      count: added.wishlist.length
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist
};
