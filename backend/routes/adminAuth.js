const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { adminLogin, getAdminMe, biometricLogin } = require('../controllers/adminAuthController');
const { adminProtect } = require('../middleware/adminAuth');

router.post('/login', [
  body('email').optional(),
  body('username').optional(),
  body('password').notEmpty().withMessage('Password is required')
], adminLogin);

router.post('/biometric-login', biometricLogin);
router.get('/me', adminProtect, getAdminMe);

module.exports = router;

