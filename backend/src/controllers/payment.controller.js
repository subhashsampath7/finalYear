const { promisePool } = require('../config/database');
const { sendPaymentNotification } = require('../config/telegram');

// Get pricing plans
const getPricingPlans = async(req, res) => {
    try {
        const [plans] = await promisePool.query(
            'SELECT * FROM pricing_plans WHERE is_active = TRUE ORDER BY duration_months ASC'
        );

        res.json({
            success: true,
            data: plans
        });
    } catch (error) {
        console.error('Get pricing plans error:', error);
        res.status(500).json({ success: false, message: 'Failed to get pricing plans' });
    }
};

// Validate discount code
const validateDiscountCode = async(req, res) => {
    try {
        const { code } = req.body;

        const [discounts] = await promisePool.query(
            `SELECT * FROM discount_codes 
       WHERE code = ? AND is_active = TRUE 
       AND (expires_at IS NULL OR expires_at > NOW())
       AND current_uses < max_uses`, [code]
        );

        if (discounts.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Invalid or expired discount code'
            });
        }

        res.json({
            success: true,
            data: {
                discountPercentage: discounts[0].discount_percentage,
                remainingUses: discounts[0].max_uses - discounts[0].current_uses
            }
        });
    } catch (error) {
        console.error('Validate discount code error:', error);
        res.status(500).json({ success: false, message: 'Failed to validate discount code' });
    }
};

// Create payment
const createPayment = async(req, res) => {
    try {
        const { planId, paymentMethod, discountCode } = req.body;
        const userId = req.user.id;

        // Get plan details
        const [plans] = await promisePool.query(
            'SELECT * FROM pricing_plans WHERE id = ? AND is_active = TRUE', [planId]
        );

        if (plans.length === 0) {
            return res.status(404).json({ success: false, message: 'Plan not found' });
        }

        const plan = plans[0];
        let discountAmount = 0;
        let discountCodeId = null;

        // Apply discount if provided
        if (discountCode) {
            const [discounts] = await promisePool.query(
                `SELECT * FROM discount_codes 
         WHERE code = ? AND is_active = TRUE 
         AND (expires_at IS NULL OR expires_at > NOW())
         AND current_uses < max_uses`, [discountCode]
            );

            if (discounts.length > 0) {
                discountCodeId = discounts[0].id;
                discountAmount = (plan.price * discounts[0].discount_percentage) / 100;

                // Increment discount code usage
                await promisePool.query(
                    'UPDATE discount_codes SET current_uses = current_uses + 1 WHERE id = ?', [discountCodeId]
                );
            }
        }

        const finalAmount = plan.price - discountAmount;

        // Create payment record
        const [result] = await promisePool.query(
            `INSERT INTO payments (user_id, plan_id, payment_method, amount, discount_code_id, discount_amount, final_amount, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`, [userId, planId, paymentMethod, plan.price, discountCodeId, discountAmount, finalAmount]
        );

        res.json({
            success: true,
            message: 'Payment created successfully',
            data: {
                paymentId: result.insertId,
                amount: plan.price,
                discountAmount,
                finalAmount,
                paymentMethod
            }
        });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ success: false, message: 'Failed to create payment' });
    }
};

// Upload payment proof (for bank transfer)
const uploadPaymentProof = async(req, res) => {
    try {
        const { paymentId } = req.body;
        const userId = req.user.id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, message: 'Payment proof is required' });
        }

        // Update payment with proof
        await promisePool.query(
            'UPDATE payments SET payment_proof = ? WHERE id = ? AND user_id = ?', [file.filename, paymentId, userId]
        );

        // Send Telegram notification
        const [payments] = await promisePool.query(
            `SELECT p.*, u.uid, u.email, u.first_name, u.last_name, pl.duration_months 
       FROM payments p 
       JOIN users u ON p.user_id = u.id 
       JOIN pricing_plans pl ON p.plan_id = pl.id 
       WHERE p.id = ?`, [paymentId]
        );

        if (payments.length > 0) {
            const payment = payments[0];
            await sendPaymentNotification({ uid: payment.uid, email: payment.email, first_name: payment.first_name, last_name: payment.last_name },
                payment.final_amount,
                payment.payment_method,
                payment.duration_months
            );
        }

        res.json({
            success: true,
            message: 'Payment proof uploaded successfully'
        });
    } catch (error) {
        console.error('Upload payment proof error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload payment proof' });
    }
};

// Process online payment (demo)
const processOnlinePayment = async(req, res) => {
    try {
        const { paymentId, cardNumber, cardExpiry, cardCVV } = req.body;
        const userId = req.user.id;

        // Demo payment - always succeeds
        const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Update payment status
        await promisePool.query(
            'UPDATE payments SET status = ?, transaction_id = ? WHERE id = ? AND user_id = ?', ['success', transactionId, paymentId, userId]
        );

        // Send Telegram notification
        const [payments] = await promisePool.query(
            `SELECT p.*, u.uid, u.email, u.first_name, u.last_name, pl.duration_months 
       FROM payments p 
       JOIN users u ON p.user_id = u.id 
       JOIN pricing_plans pl ON p.plan_id = pl.id 
       WHERE p.id = ?`, [paymentId]
        );

        if (payments.length > 0) {
            const payment = payments[0];
            await sendPaymentNotification({ uid: payment.uid, email: payment.email, first_name: payment.first_name, last_name: payment.last_name },
                payment.final_amount,
                payment.payment_method,
                payment.duration_months
            );
        }

        res.json({
            success: true,
            message: 'Payment processed successfully',
            data: { transactionId }
        });
    } catch (error) {
        console.error('Process online payment error:', error);
        res.status(500).json({ success: false, message: 'Failed to process payment' });
    }
};

// Get user payments
const getUserPayments = async(req, res) => {
    try {
        const userId = req.user.id;

        const [payments] = await promisePool.query(
            `SELECT p.*, pl.duration_months, pl.description 
       FROM payments p 
       JOIN pricing_plans pl ON p.plan_id = pl.id 
       WHERE p.user_id = ? 
       ORDER BY p.created_at DESC`, [userId]
        );

        res.json({
            success: true,
            data: payments
        });
    } catch (error) {
        console.error('Get user payments error:', error);
        res.status(500).json({ success: false, message: 'Failed to get payments' });
    }
};

module.exports = {
    getPricingPlans,
    validateDiscountCode,
    createPayment,
    uploadPaymentProof,
    processOnlinePayment,
    getUserPayments
};