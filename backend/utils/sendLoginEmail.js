/**
 * ==========================================================================
 * LOGIN EMAIL NOTIFICATION UTILITY (utils/sendLoginEmail.js)
 * Sends login notification email via Nodemailer using SMTP environment variables
 * ==========================================================================
 */

const nodemailer = require('nodemailer');

/**
 * Send Login Notification Email to Authenticated User
 * @param {Object} options - { email, name }
 */
const sendLoginEmail = async ({ email, name }) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  // Fallback / Guard: Skip external SMTP transport attempt if credentials are not configured
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log(`[LOGIN EMAIL] Notice: SMTP credentials not set in .env. Skipping external email dispatch for ${email}.`);
    return true;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort),
    secure: Number(smtpPort) === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  const loginDateStr = new Date().toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'medium'
  });

  const userName = name || 'User';

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Blogify Security'}" <${process.env.SMTP_FROM_EMAIL || smtpUser}>`,
    to: email,
    subject: 'New Login to Your Blogify Account',
    text: `Hello ${userName},

Your Blogify account was successfully logged in.

Login details:
• Account: ${email}
• Date: ${loginDateStr}

If this was you, no action is required.

If you did not perform this login, please change your password and secure your account.

Regards,
Blogify Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <h2 style="color: #10b981; margin-top: 0;">📖 Blogify</h2>
        <h3 style="font-size: 1.15rem; margin-bottom: 16px;">New Login to Your Blogify Account</h3>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>Your Blogify account was successfully logged in.</p>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #cbd5e1;">
          <h4 style="margin: 0 0 10px 0; font-size: 0.95rem;">Login details:</h4>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
            <li><strong>Account:</strong> ${email}</li>
            <li><strong>Date:</strong> ${loginDateStr}</li>
          </ul>
        </div>
        <p style="font-size: 0.9rem; color: #475569;">If this was you, no action is required.</p>
        <p style="font-size: 0.9rem; color: #dc2626; font-weight: 600;">If you did not perform this login, please change your password and secure your account.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 0.85rem; color: #94a3b8; margin: 0;">Regards,<br /><strong>Blogify Team</strong></p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  return true;
};

module.exports = sendLoginEmail;
