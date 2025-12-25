const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken, checkProfileCompleted, checkKYCVerified } = require('../middleware/auth');
const { uploadPayment } = require('../middleware/upload');
const { validatePayment } = require('../middleware/validation');

// Get pricing plans
router.get('/plans', paymentController.getPricingPlans);

// Validate discount code
router.post('/validate-discount', verifyToken, paymentController.validateDiscountCode);

// Create payment
router.post('/create',
    verifyToken,
    checkProfileCompleted,
    checkKYCVerified,
    validatePayment,
    paymentController.createPayment
);

// Upload payment proof
router.post('/upload-proof',
    verifyToken,
    uploadPayment.single('proof'),
    paymentController.uploadPaymentProof
);

// Process online payment
router.post('/process-online',
    verifyToken,
    paymentController.processOnlinePayment
);

// Get user payments
router.get('/my-payments', verifyToken, paymentController.getUserPayments);

module.exports = router;