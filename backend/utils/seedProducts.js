// Adds some sample products to MongoDB so the products page is not empty.
// Run once with: npm run seed
require('dotenv').config();

const mongoose = require('mongoose');
const Product = require('../models/product.model');

const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

const sampleProducts = [
  {
    name: 'Wireless Headphones',
    description: 'Over-ear Bluetooth headphones with deep bass and 30 hours of battery life.',
    price: 1999,
    category: 'Electronics',
    image: img('1546435770-a3e426bf472b'),
    stock: 25
  },
  {
    name: 'Smart Watch',
    description: 'Fitness smart watch with heart rate monitor, step counter and notifications.',
    price: 2499,
    category: 'Electronics',
    image: img('1523275335684-37898b6baf30'),
    stock: 12
  },
  {
    name: 'Instant Camera',
    description: 'Fun instant camera that prints photos in seconds. Great for trips and parties.',
    price: 4999,
    category: 'Electronics',
    image: img('1526170375885-4d8ecf77b99f'),
    stock: 0
  },
  {
    name: 'Running Sneakers',
    description: 'Lightweight and breathable running shoes for daily workouts.',
    price: 1799,
    category: 'Fashion',
    image: img('1542291026-7eec264c27ff'),
    stock: 30
  },
  {
    name: 'Classic Sunglasses',
    description: 'UV protected sunglasses with a classic black frame.',
    price: 899,
    category: 'Fashion',
    image: img('1572635196237-14b3f281503f'),
    stock: 4
  },
  {
    name: 'Cotton T-Shirt',
    description: 'Soft 100% cotton plain t-shirt, perfect for everyday wear.',
    price: 499,
    category: 'Fashion',
    image: img('1521572163474-6864f9cf17ab'),
    stock: 50
  },
  {
    name: 'Milk and Honey',
    description: 'Bestselling poetry book by Rupi Kaur about love, loss and healing.',
    price: 299,
    category: 'Books',
    image: img('1544947950-fa07a98d237f'),
    stock: 18
  },
  {
    name: 'Notebook Set',
    description: 'Pack of 3 ruled notebooks with hard covers, 200 pages each.',
    price: 349,
    category: 'Books',
    image: img('1531346878377-a5be20888e57'),
    stock: 40
  },
  {
    name: 'Indoor Plant',
    description: 'Low maintenance indoor plant in a ceramic pot. Brightens up any desk.',
    price: 749,
    category: 'Home',
    image: img('1485955900006-10f4d324d411'),
    stock: 15
  },
  {
    name: 'Desk Lamp',
    description: 'Adjustable LED desk lamp with three brightness levels.',
    price: 1149,
    category: 'Home',
    image: img('1507473885765-e6ed057f782c'),
    stock: 8
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`Products collection already has ${count} products. Skipping seed.`);
    } else {
      await Product.insertMany(sampleProducts);
      console.log(`Inserted ${sampleProducts.length} sample products`);
    }
  } catch (error) {
    console.error('Seeding failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
