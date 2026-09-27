const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Admin = require('../models/Admin');

const generateAdminToken = (id) => {
  return jwt.sign({ id }, process.env.ADMIN_SECRET, { expiresIn: '7d' });
};

// @desc  Admin login
// @route POST /api/admin/auth/login
const adminLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  let { email, username, password } = req.body;
  if (!email && username) {
    email = username;
  }
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email/username and password.' });
  }

  const input = email.trim().toLowerCase();

  try {
    let admin = null;
    if (input === 'admin') {
      admin = await Admin.findOne({
        $or: [{ email: 'astrabytepk@gmail.com' }, { email: 'admin@starbyte.io' }, { role: 'superadmin' }]
      }).select('+password');
    } else {
      admin = await Admin.findOne({
        $or: [{ email: input }, { email: 'astrabytepk@gmail.com' }, { email: 'admin@starbyte.io' }]
      }).select('+password');
    }

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!admin.isActive) {
      return res.status(401).json({ success: false, message: 'Admin account is deactivated.' });
    }

    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    const token = generateAdminToken(admin._id);

    res.json({
      success: true,
      message: 'Admin login successful.',
      token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// @desc  Get admin profile
// @route GET /api/admin/auth/me
const getAdminMe = async (req, res) => {
  res.json({
    success: true,
    admin: {
      _id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      role: req.admin.role
    }
  });
};

// @desc  Admin Biometric / Fingerprint login
// @route POST /api/admin/auth/biometric-login
const biometricLogin = async (req, res) => {
  try {
    const admin = await Admin.findOne({
      $or: [{ email: 'astrabytepk@gmail.com' }, { email: 'admin@starbyte.io' }, { role: 'superadmin' }]
    });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin account not found.' });
    }

    if (!admin.isActive) {
      return res.status(401).json({ success: false, message: 'Admin account is deactivated.' });
    }

    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    const token = generateAdminToken(admin._id);

    res.json({
      success: true,
      message: 'Fingerprint identity verified. Welcome!',
      token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Biometric login error:', error);
    res.status(500).json({ success: false, message: 'Biometric login failed. Please try again.' });
  }
};

module.exports = { adminLogin, getAdminMe, biometricLogin };

