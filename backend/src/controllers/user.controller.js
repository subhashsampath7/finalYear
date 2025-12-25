const { promisePool } = require('../config/database');
const { sendWelcomeEmail } = require('../services/email.service');

// Update user profile
const updateProfile = async(req, res) => {
    try {
        const { firstName, middleName, lastName, address, phone, dateOfBirth, gender } = req.body;
        const userId = req.user.id;

        // Check if profile already completed
        if (req.user.profile_completed) {
            return res.status(400).json({
                success: false,
                message: 'Profile already completed and cannot be edited'
            });
        }

        // Update user profile
        await promisePool.query(
            `UPDATE users SET 
       first_name = ?, middle_name = ?, last_name = ?, address = ?, 
       phone = ?, date_of_birth = ?, gender = ?, profile_completed = TRUE 
       WHERE id = ?`, [firstName, middleName, lastName, address, phone, dateOfBirth, gender, userId]
        );

        // Send welcome email with name
        const [users] = await promisePool.query('SELECT email, uid FROM users WHERE id = ?', [userId]);
        await sendWelcomeEmail(users[0].email, `${firstName} ${lastName}`, users[0].uid);

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
};

// Get user dashboard data
const getDashboardData = async(req, res) => {
    try {
        const userId = req.user.id;

        // Get user info
        const [users] = await promisePool.query(
            'SELECT uid, email, first_name, last_name, kyc_status, profile_completed FROM users WHERE id = ?', [userId]
        );

        // Get active licenses
        const [licenses] = await promisePool.query(
            `SELECT l.*, p.duration_months 
       FROM licenses l 
       JOIN pricing_plans p ON l.plan_id = p.id 
       WHERE l.user_id = ? AND l.status = 'active'
       ORDER BY l.created_at DESC`, [userId]
        );

        // Get pending payments
        const [payments] = await promisePool.query(
            `SELECT p.*, pl.duration_months 
       FROM payments p 
       JOIN pricing_plans pl ON p.plan_id = pl.id 
       WHERE p.user_id = ? AND p.status = 'pending'
       ORDER BY p.created_at DESC`, [userId]
        );

        res.json({
            success: true,
            data: {
                user: users[0],
                activeLicenses: licenses,
                pendingPayments: payments
            }
        });
    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ success: false, message: 'Failed to get dashboard data' });
    }
};

module.exports = {
    updateProfile,
    getDashboardData
};