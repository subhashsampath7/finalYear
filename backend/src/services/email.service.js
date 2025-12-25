const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Verify transporter
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email service error:', error.message);
    } else {
        console.log('✅ Email service ready');
    }
});

// Send welcome email
const sendWelcomeEmail = async(email, name, uid) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Welcome to Google Ads Transparency Extension',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4285f4;">Welcome to Google Ads Transparency Extension!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering with us. Your account has been created successfully.</p>
        <p><strong>Your User ID (UID):</strong> ${uid}</p>
        <p>Please complete your profile and KYC verification to start using our extension.</p>
        <p>Best regards,<br>Google Ads Transparency Team</p>
      </div>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

// Send license key email
const sendLicenseKeyEmail = async(email, name, licenseKey, expiryDate) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Your License Key - Google Ads Transparency Extension',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4285f4;">Your License Key is Ready!</h2>
        <p>Hi ${name},</p>
        <p>Your payment has been confirmed. Here is your license key:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h3 style="color: #333; font-size: 24px; letter-spacing: 2px; margin: 0;">${licenseKey}</h3>
        </div>
        <p><strong>Expiry Date:</strong> ${new Date(expiryDate).toLocaleDateString()}</p>
        <p><strong>How to activate:</strong></p>
        <ol>
          <li>Open the Google Ads Transparency Extension</li>
          <li>Enter your license key</li>
          <li>Click "Activate"</li>
        </ol>
        <p>Best regards,<br>Google Ads Transparency Team</p>
      </div>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

// Send expiry reminder email
const sendExpiryReminderEmail = async(email, name, licenseKey, daysLeft) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'License Expiring Soon - Google Ads Transparency Extension',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f4b400;">Your License is Expiring Soon!</h2>
        <p>Hi ${name},</p>
        <p>Your license key <strong>${licenseKey}</strong> will expire in <strong>${daysLeft} days</strong>.</p>
        <p>To continue using the Google Ads Transparency Extension without interruption, please renew your license.</p>
        <p><a href="${process.env.FRONTEND_URL}/purchase" style="background: #4285f4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">Renew Now</a></p>
        <p>Best regards,<br>Google Ads Transparency Team</p>
      </div>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

// Send payment failed email
const sendPaymentFailedEmail = async(email, name, reason) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Payment Failed - Google Ads Transparency Extension',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ea4335;">Payment Failed</h2>
        <p>Hi ${name},</p>
        <p>Unfortunately, your payment could not be processed.</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p>Please try again or contact your bank for more information.</p>
        <p><a href="${process.env.FRONTEND_URL}/purchase" style="background: #4285f4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">Try Again</a></p>
        <p>Best regards,<br>Google Ads Transparency Team</p>
      </div>
    `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

// Send KYC status email
const sendKYCStatusEmail = async(email, name, status, reason = null) => {
        const isApproved = status === 'verified';
        const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: email,
                subject: `KYC ${isApproved ? 'Approved' : 'Declined'} - Google Ads Transparency Extension`,
                html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${isApproved ? '#34a853' : '#ea4335'};">KYC ${isApproved ? 'Approved' : 'Declined'}</h2>
        <p>Hi ${name},</p>
        ${isApproved 
          ? '<p>Your KYC verification has been approved. You can now purchase a license key.</p>'
          : `<p>Your KYC verification has been declined.</p><p><strong>Reason:</strong> ${reason}</p><p>Please submit your documents again with the correct information.</p>`
        }
        <p>Best regards,<br>Google Ads Transparency Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendLicenseKeyEmail,
  sendExpiryReminderEmail,
  sendPaymentFailedEmail,
  sendKYCStatusEmail
};