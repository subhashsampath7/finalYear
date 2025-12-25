const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');

// Update profile
router.put('/profile', verifyToken, validateProfileUpdate, userController.updateProfile);

// Get dashboard data
router.get('/dashboard', verifyToken, userController.getDashboardData);

module.exports = router;