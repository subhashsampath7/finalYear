const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { promisePool } = require('../config/database');
const { generateUniqueLicenseKey, calculateExpiryDate, calculateDaysUntilExpiry } = require('../utils/generators');
const { sendLicenseKeyEmail, sendKYCStatusEmail, sendPaymentFailedEmail } = require('../services/email.service');

// Admin login
const adminLogin = async(req, res) => {
    try {
        const { username, password } = req.body;

        const [admins] = await promisePool.query(
            'SELECT * FROM admin_users WHERE username = ? AND is_active = TRUE', [username]
        );

        if (admins.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const admin = admins[0];

        // For demo, accept any password or check bcrypt
        const isValidPassword = password === process.env.ADMIN_DEFAULT_PASSWORD ||
            await bcrypt.compare(password, admin.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Update last login
        await promisePool.query('UPDATE admin_users SET last_login = NOW() WHERE id = ?', [admin.id]);

        // Generate token
        const token = jwt.sign({ adminId: admin.id, username: admin.username, role: admin.role, isAdmin: true },
            process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                username: admin.username,
                role: admin.role,
                token
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
};

// Get dashboard statistics
const getDashboardStats = async(req, res) => {
    try {
        const [totalUsers] = await promisePool.query('SELECT COUNT(*) as count FROM users');
        const [pendingKYC] = await promisePool.query('SELECT COUNT(*) as count FROM kyc_verifications WHERE status = "pending"');
        const [pendingPayments] = await promisePool.query('SELECT COUNT(*) as count FROM payments WHERE status = "pending"');
        const [activeLicenses] = await promisePool.query('SELECT COUNT(*) as count FROM licenses WHERE status = "active"');
        const [totalRevenue] = await promisePool.query('SELECT SUM(final_amount) as total FROM payments WHERE status = "success"');

        res.json({
            success: true,
            data: {
                totalUsers: totalUsers[0].count,
                pendingKYC: pendingKYC[0].count,
                pendingPayments: pendingPayments[0].count,
                activeLicenses: activeLicenses[0].count,
                totalRevenue: totalRevenue[0].total || 0
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Failed to get statistics' });
    }
};

// Get all users
const getAllUsers = async(req, res) => {
    try {
        const [users] = await promisePool.query(
            `SELECT id, uid, email, first_name, middle_name, last_name, phone, 
       kyc_status, profile_completed, created_at 
       FROM users 
       ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ success: false, message: 'Failed to get users' });
    }
};

// Get pending KYC verifications
const getPendingKYC = async(req, res) => {
    try {
        const [kyc] = await promisePool.query(
            `SELECT k.*, u.uid, u.email, u.first_name, u.last_name 
       FROM kyc_verifications k 
       JOIN users u ON k.user_id = u.id 
       WHERE k.status = 'pending' 
       ORDER BY k.submitted_at DESC`
        );

        res.json({
            success: true,
            data: kyc
        });
    } catch (error) {
        console.error('Get pending KYC error:', error);
        res.status(500).json({ success: false, message: 'Failed to get KYC verifications' });
    }
};

// Review KYC verification
const reviewKYC = async(req, res) => {
    try {
        const { kycId, status, declineReason } = req.body;
        const adminId = req.admin.id;

        if (!['approved', 'declined'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        if (status === 'declined' && !declineReason) {
            return res.status(400).json({ success: false, message: 'Decline reason is required' });
        }

        // Update KYC verification
        await promisePool.query(
            'UPDATE kyc_verifications SET status = ?, decline_reason = ?, reviewed_at = NOW(), reviewed_by = ? WHERE id = ?', [status, declineReason, adminId, kycId]
        );

        // Update user KYC status
        const userStatus = status === 'approved' ? 'verified' : 'declined';
        const [kyc] = await promisePool.query('SELECT user_id FROM kyc_verifications WHERE id = ?', [kycId]);

        await promisePool.query(
            'UPDATE users SET kyc_status = ?, kyc_decline_reason = ? WHERE id = ?', [userStatus, declineReason, kyc[0].user_id]
        );

        // Send email notification
        const [users] = await promisePool.query(
            'SELECT email, first_name, last_name FROM users WHERE id = ?', [kyc[0].user_id]
        );

        if (users.length > 0) {
            await sendKYCStatusEmail(
                users[0].email,
                `${users[0].first_name} ${users[0].last_name}`,
                userStatus,
                declineReason
            );
        }

        res.json({
            success: true,
            message: `KYC ${status} successfully`
        });
    } catch (error) {
        console.error('Review KYC error:', error);
        res.status(500).json({ success: false, message: 'Failed to review KYC' });
    }
};

// Get all payments
const getAllPayments = async(req, res) => {
    try {
        const [payments] = await promisePool.query(
            `SELECT p.*, u.uid, u.email, u.first_name, u.last_name, pl.duration_months 
       FROM payments p 
       JOIN users u ON p.user_id = u.id 
       JOIN pricing_plans pl ON p.plan_id = pl.id 
       ORDER BY p.created_at DESC`
        );

        res.json({
            success: true,
            data: payments
        });
    } catch (error) {
        console.error('Get all payments error:', error);
        res.status(500).json({ success: false, message: 'Failed to get payments' });
    }
};

// Review payment
const reviewPayment = async(req, res) => {
    try {
        const { paymentId, status, declineReason } = req.body;

        if (!['success', 'failed', 'declined'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        // Get payment details
        const [payments] = await promisePool.query(
            `SELECT p.*, u.email, u.first_name, u.last_name, pl.duration_months 
       FROM payments p 
       JOIN users u ON p.user_id = u.id 
       JOIN pricing_plans pl ON p.plan_id = pl.id 
       WHERE p.id = ?`, [paymentId]
        );

        if (payments.length === 0) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        const payment = payments[0];

        // Update payment status
        await promisePool.query(
            'UPDATE payments SET status = ?, decline_reason = ? WHERE id = ?', [status, declineReason, paymentId]
        );

        if (status === 'success') {
            // Generate license key
            const licenseKey = await generateUniqueLicenseKey(promisePool);
            const expiryDate = calculateExpiryDate(payment.duration_months);

            await promisePool.query(
                'INSERT INTO licenses (user_id, payment_id, license_key, plan_id, expires_at, status) VALUES (?, ?, ?, ?, ?, ?)', [payment.user_id, paymentId, licenseKey, payment.plan_id, expiryDate, 'active']
            );

            // Send license key email
            await sendLicenseKeyEmail(
                payment.email,
                `${payment.first_name} ${payment.last_name}`,
                licenseKey,
                expiryDate
            );
        } else {
            // Send payment failed email
            const reason = declineReason || 'Your payment has not been received. Please contact your bank.';
            await sendPaymentFailedEmail(
                payment.email,
                `${payment.first_name} ${payment.last_name}`,
                reason
            );
        }

        res.json({
            success: true,
            message: `Payment ${status} successfully`
        });
    } catch (error) {
        console.error('Review payment error:', error);
        res.status(500).json({ success: false, message: 'Failed to review payment' });
    }
};

// Get all licenses
const getAllLicenses = async(req, res) => {
    try {
        const [licenses] = await promisePool.query(
            `SELECT l.*, u.uid, u.email, u.first_name, u.last_name, p.duration_months 
       FROM licenses l 
       JOIN users u ON l.user_id = u.id 
       JOIN pricing_plans p ON l.plan_id = p.id 
       ORDER BY l.created_at DESC`
        );

        // Calculate days remaining
        const licensesWithDays = licenses.map(license => ({
            ...license,
            daysRemaining: calculateDaysUntilExpiry(license.expires_at)
        }));

        res.json({
            success: true,
            data: licensesWithDays
        });
    } catch (error) {
        console.error('Get all licenses error:', error);
        res.status(500).json({ success: false, message: 'Failed to get licenses' });
    }
};

// Update pricing plan
const updatePricingPlan = async(req, res) => {
    try {
        const { planId, price, description, features } = req.body;

        await promisePool.query(
            'UPDATE pricing_plans SET price = ?, description = ?, features = ? WHERE id = ?', [price, description, JSON.stringify(features), planId]
        );

        res.json({
            success: true,
            message: 'Pricing plan updated successfully'
        });
    } catch (error) {
        console.error('Update pricing plan error:', error);
        res.status(500).json({ success: false, message: 'Failed to update pricing plan' });
    }
};

// Create discount code
const createDiscountCode = async(req, res) => {
    try {
        const { code, discountPercentage, maxUses, expiresAt } = req.body;

        await promisePool.query(
            'INSERT INTO discount_codes (code, discount_percentage, max_uses, expires_at) VALUES (?, ?, ?, ?)', [code, discountPercentage, maxUses, expiresAt || null]
        );

        res.json({
            success: true,
            message: 'Discount code created successfully'
        });
    } catch (error) {
        console.error('Create discount code error:', error);
        res.status(500).json({ success: false, message: 'Failed to create discount code' });
    }
};

// Get all discount codes
const getAllDiscountCodes = async(req, res) => {
    try {
        const [codes] = await promisePool.query(
            'SELECT * FROM discount_codes ORDER BY created_at DESC'
        );

        res.json({
            success: true,
            data: codes
        });
    } catch (error) {
        console.error('Get discount codes error:', error);
        res.status(500).json({ success: false, message: 'Failed to get discount codes' });
    }
};

// Toggle discount code status
const toggleDiscountCode = async(req, res) => {
    try {
        const { codeId, isActive } = req.body;

        await promisePool.query(
            'UPDATE discount_codes SET is_active = ? WHERE id = ?', [isActive, codeId]
        );

        res.json({
            success: true,
            message: 'Discount code status updated'
        });
    } catch (error) {
        console.error('Toggle discount code error:', error);
        res.status(500).json({ success: false, message: 'Failed to update discount code' });
    }
};

module.exports = {
    adminLogin,
    getDashboardStats,
    getAllUsers,
    getPendingKYC,
    reviewKYC,
    getAllPayments,
    reviewPayment,
    getAllLicenses,
    updatePricingPlan,
    createDiscountCode,
    getAllDiscountCodes,
    toggleDiscountCode
};