import nodemailer from 'nodemailer';

// Email configuration using provided credentials
const emailConfig = {
  host: 'smtp.averox.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: '123@averox.com',
    pass: 'Averox@123'
  }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Verify email configuration
export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log('✓ Email server connection verified');
    return true;
  } catch (error) {
    console.error('✗ Email server connection failed:', error);
    return false;
  }
}

// Send email function
export async function sendEmail(options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}) {
  try {
    const mailOptions = {
      from: options.from || '123@averox.com',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✓ Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('✗ Failed to send email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Send welcome email
export async function sendWelcomeEmail(userEmail: string, userName: string) {
  console.log(`📧 Preparing welcome email for: ${userEmail} (${userName})`);
  
  const subject = 'Welcome to Averox CRM!';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Welcome to Averox CRM, ${userName}!</h2>
      <p>Thank you for joining Averox CRM. Your account has been successfully created.</p>
      <p>You can now access all the powerful features of our platform:</p>
      <ul>
        <li>Customer Relationship Management</li>
        <li>Sales Pipeline Tracking</li>
        <li>Communication Center</li>
        <li>Analytics and Reporting</li>
        <li>And much more...</li>
      </ul>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>The Averox Team</p>
    </div>
  `;

  const result = await sendEmail({
    to: userEmail,
    subject,
    html
  });
  
  console.log(`📧 Welcome email result:`, result);
  return result;
}

// Send password reset email
export async function sendPasswordResetEmail(userEmail: string, resetToken: string) {
  const subject = 'Password Reset - Averox CRM';
  const resetUrl = `${process.env.FRONTEND_URL || 'https://your-domain.com'}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Password Reset Request</h2>
      <p>You have requested to reset your password for your Averox CRM account.</p>
      <p>Click the button below to reset your password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
      </div>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 1 hour for security reasons.</p>
      <p>If you didn't request this password reset, please ignore this email.</p>
      <p>Best regards,<br>The Averox Team</p>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    subject,
    html
  });
}

// Send notification email
export async function sendNotificationEmail(userEmail: string, title: string, message: string) {
  const subject = `Notification: ${title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">${title}</h2>
      <p>${message}</p>
      <p>Best regards,<br>The Averox Team</p>
    </div>
  `;

  return await sendEmail({
    to: userEmail,
    subject,
    html
  });
}

// Send account creation notification to admin
export async function sendAdminAccountNotification(newUserEmail: string, newUserName: string) {
  const subject = 'New Account Created - Averox CRM';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">New Account Created</h2>
      <p>A new user account has been created in Averox CRM:</p>
      <ul>
        <li><strong>Name:</strong> ${newUserName}</li>
        <li><strong>Email:</strong> ${newUserEmail}</li>
        <li><strong>Created:</strong> ${new Date().toLocaleString()}</li>
      </ul>
      <p>Best regards,<br>Averox System</p>
    </div>
  `;

  // Send to admin email (you can configure this)
  return await sendEmail({
    to: '123@averox.com', // Admin email
    subject,
    html
  });
}

// Initialize email service
export async function initializeEmailService() {
  console.log('🔧 Initializing email service...');
  const isConnected = await verifyEmailConnection();
  
  if (isConnected) {
    console.log('✅ Email service initialized successfully');
  } else {
    console.log('❌ Email service initialization failed');
  }
  
  return isConnected;
}