const mongoose = require('mongoose');
const Product = require('../models/product.model');

// POST /products
async function createProduct(req, res) {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || !category || !image || price === undefined || stock === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ message: 'Price must be a number greater than 0' });
    }

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ message: 'Stock must be a number and cannot be negative' });
    }

    const product = await Product.create({ name, description, price, category, image, stock });

    return res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: 'Server error' });
  }
}

// GET /products?search=keyboard&category=Electronics&sort=price_asc
async function getProducts(req, res) {
  try {
    const { search, category, sort } = req.query;

    // build the filter step by step, only adding what the user sent
    const filter = {};

    if (search) {
      // escape special characters like ( + * so they are searched as normal text
      const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // "i" option makes the search case-insensitive
      filter.name = { $regex: safeSearch, $options: 'i' };
    }

    if (category) {
      filter.category = category;
    }

    // newest products first by default
    let sortOption = { createdAt: -1 };

    if (sort === 'price_asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { price: -1 };
    }

    // only send the fields the product cards need
    const products = await Product.find(filter)
      .select('name price category image stock')
      .sort(sortOption);

    return res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}

// GET /products/:id
async function getProductById(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json({
      success: true,
      product
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  createProduct,
  getProducts,
  getProductById
};
