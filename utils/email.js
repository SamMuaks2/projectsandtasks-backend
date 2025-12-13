// const nodemailer = require('nodemailer');

// // Create reusable transporter
// const createTransporter = () => {
//   // Use environment variables for email configuration
//   // For development, you can use Gmail or other SMTP services
//   // For production, use a service like SendGrid, AWS SES, etc.
  
//   const transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST || 'smtp.gmail.com',
//     port: process.env.SMTP_PORT || 587,
//     secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
//     auth: {
//       user: process.env.SMTP_USER || process.env.EMAIL_USER,
//       pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD
//     }
//   });

//   return transporter;
// };

// // Send email notification
// exports.sendEmail = async (to, subject, html, text = null) => {
//   try {
//     // Skip email sending if SMTP is not configured
//     if (!process.env.SMTP_USER && !process.env.EMAIL_USER) {
//       console.log('Email not configured. Skipping email send to:', to);
//       return { success: false, message: 'Email not configured' };
//     }

//     const transporter = createTransporter();
    
//     const mailOptions = {
//       from: process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER,
//       to: Array.isArray(to) ? to.join(', ') : to,
//       subject: subject,
//       html: html,
//       text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log('Email sent successfully:', info.messageId);
//     return { success: true, messageId: info.messageId };
//   } catch (error) {
//     console.error('Error sending email:', error);
//     return { success: false, error: error.message };
//   }
// };

// // Send notification email to user
// exports.sendNotificationEmail = async (user, notification) => {
//   try {
//     if (!user || !user.email) {
//       console.log('User email not available');
//       return { success: false, message: 'User email not available' };
//     }

//     const emailSubject = notification.title || 'New Notification';
    
//     // Create HTML email template
//     const emailHtml = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <style>
//           body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
//           .container { max-width: 600px; margin: 0 auto; padding: 20px; }
//           .header { background-color: #3498db; color: white; padding: 20px; text-align: center; }
//           .content { padding: 20px; background-color: #f9f9f9; }
//           .message { margin: 20px 0; }
//           .footer { text-align: center; padding: 20px; color: #777; font-size: 12px; }
//           .button { display: inline-block; padding: 10px 20px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px; }
//         </style>
//       </head>
//       <body>
//         <div class="container">
//           <div class="header">
//             <h1>GIC Projects</h1>
//           </div>
//           <div class="content">
//             <h2>${emailSubject}</h2>
//             <div class="message">
//               <p>${notification.message}</p>
//             </div>
//             <p>Please log in to your dashboard to view more details.</p>
//           </div>
//           <div class="footer">
//             <p>This is an automated notification from GIC Projects.</p>
//             <p>Please do not reply to this email.</p>
//           </div>
//         </div>
//       </body>
//       </html>
//     `;

//     return await this.sendEmail(user.email, emailSubject, emailHtml);
//   } catch (error) {
//     console.error('Error sending notification email:', error);
//     return { success: false, error: error.message };
//   }
// };

const nodemailer = require('nodemailer');

// Check if email is properly configured
const isEmailConfigured = () => {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
};

// Create reusable transporter
const createTransporter = () => {
  if (!isEmailConfigured()) {
    console.warn('⚠️  Email not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS in environment variables.');
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      },
      // Add timeout settings
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    });

    return transporter;
  } catch (error) {
    console.error('Error creating email transporter:', error.message);
    return null;
  }
};

// Send email notification
exports.sendEmail = async (to, subject, html, text = null) => {
  try {
    // Check if email is configured
    if (!isEmailConfigured()) {
      console.log('📧 Email not configured. Would have sent to:', to, '| Subject:', subject);
      return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();
    if (!transporter) {
      return { success: false, message: 'Failed to create email transporter' };
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject: subject,
      html: html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', to, '| Message ID:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email to', to, ':', error.message);
    return { success: false, error: error.message };
  }
};

// Send notification email to user
exports.sendNotificationEmail = async (user, notification) => {
  try {
    if (!user || !user.email) {
      console.log('User email not available for notification');
      return { success: false, message: 'User email not available' };
    }

    const emailSubject = notification.title || 'New Notification';
    const companyName = process.env.COMPANY_NAME || 'GIC Projects';
    const appUrl = process.env.CLIENT_URL || 'https://gicprojects.com.ng';
    
    // Create HTML email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 0; }
          .header { background-color: #3498db; color: white; padding: 30px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 30px 20px; background-color: #f9f9f9; }
          .content h2 { color: #2c3e50; margin-top: 0; }
          .message { 
            margin: 20px 0; 
            padding: 20px; 
            background-color: white; 
            border-left: 4px solid #3498db;
            border-radius: 4px;
          }
          .button { 
            display: inline-block; 
            padding: 12px 30px; 
            background-color: #3498db; 
            color: white !important; 
            text-decoration: none; 
            border-radius: 5px; 
            margin-top: 20px;
            font-weight: bold;
          }
          .footer { 
            text-align: center; 
            padding: 20px; 
            color: #777; 
            font-size: 12px; 
            background-color: #f0f0f0;
          }
          .footer p { margin: 5px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${companyName}</h1>
          </div>
          <div class="content">
            <h2>${emailSubject}</h2>
            <div class="message">
              <p>${notification.message}</p>
            </div>
            <p>Log in to your dashboard to view more details and take action.</p>
            <a href="${appUrl}" class="button">Go to Dashboard</a>
          </div>
          <div class="footer">
            <p>This is an automated notification from ${companyName}.</p>
            <p>Please do not reply to this email.</p>
            <p style="margin-top: 15px;">
              <a href="${appUrl}" style="color: #3498db; text-decoration: none;">Visit Dashboard</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return await this.sendEmail(user.email, emailSubject, emailHtml);
  } catch (error) {
    console.error('Error sending notification email:', error.message);
    return { success: false, error: error.message };
  }
};

// Test email configuration on startup
exports.testEmailConfiguration = async () => {
  if (!isEmailConfigured()) {
    console.log('⚠️  Email notifications are DISABLED. To enable:');
    console.log('   1. Set SMTP_HOST (e.g., smtp.gmail.com)');
    console.log('   2. Set SMTP_USER (your email address)');
    console.log('   3. Set SMTP_PASS (your email password or app password)');
    console.log('   4. Optionally set SMTP_PORT (default: 587)');
    console.log('   5. Optionally set EMAIL_FROM (sender name)');
    return false;
  }

  try {
    const transporter = createTransporter();
    if (!transporter) {
      console.error('❌ Failed to create email transporter');
      return false;
    }

    await transporter.verify();
    console.log('✅ Email configuration verified successfully!');
    console.log(`📧 Emails will be sent from: ${process.env.EMAIL_FROM || process.env.SMTP_USER}`);
    return true;
  } catch (error) {
    console.error('❌ Email configuration test failed:', error.message);
    console.log('   Please check your SMTP credentials and settings.');
    return false;
  }
};