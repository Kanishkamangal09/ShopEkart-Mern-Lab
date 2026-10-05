const bcrypt = require('bcrypt');
const Customer = require('../models/customer.model');
const generateToken = require('../utils/generateToken');

async function registerCustomer(req, res) {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const customer = await Customer.create({
      fullName,
      email,
      password: hashedPassword,
      phone
    });

    return res.status(201).json({
      success: true,
      message: 'Customer registered successfully',
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    return res.status(500).json({ message: 'Server error' });
  }
}

async function loginCustomer(req, res) {
  try {
    const { email, password } = req.body;
    const customer = await Customer.findOne({ email });

    if (!customer || !(await bcrypt.compare(password || '', customer.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(customer._id.toString());
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      message: 'Login successful'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}

function getMyProfile(req, res) {
  const { _id, fullName, email, phone, createdAt } = req.user;

  return res.json({
    _id,
    fullName,
    email,
    phone,
    createdAt
  });
}

function logoutCustomer(req, res) {
  res.clearCookie('token');

  return res.json({
    success: true,
    message: 'Logged out successfully'
  });
}

async function changePassword(req, res) {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    const isOldPasswordCorrect = await bcrypt.compare(oldPassword, req.user.password);
    if (!isOldPasswordCorrect) {
      return res.status(401).json({ message: 'Incorrect old password' });
    }

    req.user.password = await bcrypt.hash(newPassword, 10);
    await req.user.save();

    return res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
  changePassword
};
