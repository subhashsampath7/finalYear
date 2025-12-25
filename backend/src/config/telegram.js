const axios = require('axios');
require('dotenv').config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Send message to Telegram
const sendTelegramMessage = async(message) => {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.warn('⚠️ Telegram credentials not configured');
        return { success: false, error: 'Telegram not configured' };
    }

    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await axios.post(url, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        });

        return { success: true, data: response.data };
    } catch (error) {
        console.error('❌ Telegram send failed:', error.message);
        return { success: false, error: error.message };
    }
};

// Send KYC notification
const sendKYCNotification = async(user, documentType) => {
    const message = `
🆔 <b>New KYC Submission</b>

👤 User: ${user.first_name} ${user.last_name}
📧 Email: ${user.email}
🔢 UID: ${user.uid}
📄 Document Type: ${documentType.toUpperCase()}
⏰ Time: ${new Date().toLocaleString()}

Please review the KYC documents in the admin panel.
  `.trim();

    return await sendTelegramMessage(message);
};

// Send payment notification
const sendPaymentNotification = async(user, amount, paymentMethod, plan) => {
    const message = `
💰 <b>New Payment Received</b>

👤 User: ${user.first_name} ${user.last_name}
📧 Email: ${user.email}
🔢 UID: ${user.uid}
💵 Amount: $${amount}
💳 Method: ${paymentMethod.toUpperCase()}
📦 Plan: ${plan} month(s)
⏰ Time: ${new Date().toLocaleString()}

Please review the payment in the admin panel.
  `.trim();

    return await sendTelegramMessage(message);
};

module.exports = {
    sendTelegramMessage,
    sendKYCNotification,
    sendPaymentNotification
};