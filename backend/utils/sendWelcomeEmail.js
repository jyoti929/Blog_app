/**
 * ==========================================================================
 * WELCOME / SIGNUP EMAIL NOTIFICATION UTILITY (utils/sendWelcomeEmail.js)
 * Sends welcome email notification upon user registration
 * ==========================================================================
 */

const nodemailer = require('nodemailer');

/**
 * Send Welcome Email to Newly Registered User
 * @param {Object} options - { email, name }
 */
const sendWelcomeEmail = async ({ email, name }) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  // Fallback / Guard: Skip external SMTP transport attempt if credentials are not configured
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log(`[WELCOME EMAIL] Notice: SMTP credentials not set in .env. Skipping external email dispatch for ${email}.`);
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

  const userName = name || 'Writer';

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Blogify Team'}" <${process.env.SMTP_FROM_EMAIL || smtpUser}>`,
    to: email,
    subject: 'Welcome to Blogify! 🎉',
    text: `Hello ${userName},

Welcome to Blogify! Your account has been successfully created.

Account details:
• Email: ${email}
• Date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

You can now log in, create stories, and publish blogs to inspire readers worldwide.

Regards,
Blogify Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <h2 style="color: #10b981; margin-top: 0;">📖 Blogify</h2>
        <h3 style="font-size: 1.2rem; margin-bottom: 16px;">Welcome to Blogify! 🎉</h3>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>Thank you for signing up! Your Blogify account has been created successfully.</p>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #cbd5e1;">
          <h4 style="margin: 0 0 10px 0; font-size: 0.95rem;">Account details:</h4>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Joined On:</strong> ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</li>
          </ul>
        </div>
        <p>You can now log in, draft your stories, and publish blogs to inspire our global community of readers.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 0.85rem; color: #94a3b8; margin: 0;">Regards,<br /><strong>Blogify Team</strong></p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  return true;
};

module.exports = sendWelcomeEmail;
