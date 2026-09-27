const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminProtect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Admin access required. Token missing.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin not found.' });
    }

    if (!admin.isActive) {
      return res.status(401).json({ success: false, message: 'Admin account is deactivated.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Admin token expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid admin token.' });
  }
};

module.exports = { adminProtect };
