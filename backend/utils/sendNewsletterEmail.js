/**
 * ==========================================================================
 * NEWSLETTER EMAIL NOTIFICATION UTILITY (utils/sendNewsletterEmail.js)
 * Sends subscription confirmation email upon newsletter signup
 * ==========================================================================
 */

const nodemailer = require('nodemailer');

/**
 * Send Newsletter Subscription Confirmation Email
 * @param {Object} options - { email }
 */
const sendNewsletterEmail = async ({ email }) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT || 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  // Fallback / Guard: Skip external SMTP transport attempt if credentials are not configured
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log(`[NEWSLETTER EMAIL] Notice: SMTP credentials not set in .env. Skipping email dispatch for ${email}.`);
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

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const mailOptions = {
    from: `"${process.env.SMTP_FROM_NAME || 'Blogify Team'}" <${process.env.SMTP_FROM_EMAIL || smtpUser}>`,
    to: email,
    subject: 'Thank You for Subscribing to Blogify! 📬',
    text: `Hello,

Thank you for subscribing to the Blogify Newsletter!

Subscription details:
• Email: ${email}
• Date: ${formattedDate}

You will now receive our latest articles, trending stories, and community updates directly in your inbox.

Regards,
Blogify Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
        <h2 style="color: #10b981; margin-top: 0;">📖 Blogify Newsletter</h2>
        <h3 style="font-size: 1.2rem; margin-bottom: 16px;">Thank You for Subscribing! 📬</h3>
        <p>Hello,</p>
        <p>You have successfully subscribed to the <strong>Blogify Newsletter</strong>.</p>
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #cbd5e1;">
          <h4 style="margin: 0 0 10px 0; font-size: 0.95rem;">Subscription details:</h4>
          <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Date:</strong> ${formattedDate}</li>
          </ul>
        </div>
        <p>You will now receive our latest articles, trending engineering & travel stories, and community updates delivered straight to your inbox.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 0.85rem; color: #94a3b8; margin: 0;">Regards,<br /><strong>Blogify Team</strong></p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`[NEWSLETTER EMAIL] Confirmation email sent successfully to ${email}`);
  return true;
};

module.exports = sendNewsletterEmail;
