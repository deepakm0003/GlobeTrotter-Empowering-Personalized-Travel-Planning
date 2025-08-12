const nodemailer = require('nodemailer');

// Email configuration
const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'deepak23188@iiitd.ac.in', // Your Gmail address
    pass: 'fthi navb ckat twxq'     // Your app password
  }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Email templates
const emailTemplates = {
  passwordReset: (resetUrl, userName) => ({
    subject: 'Reset Your GlobeTrotter Password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
          }
          .logo-text {
            color: white;
            font-size: 24px;
            font-weight: bold;
          }
          h1 {
            color: #333;
            margin: 0;
            font-size: 28px;
          }
          .content {
            margin: 30px 0;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin: 20px 0;
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <span class="logo-text">GT</span>
            </div>
            <h1>Reset Your Password</h1>
          </div>
          
          <div class="content">
            <p>Hello ${userName || 'there'},</p>
            
            <p>We received a request to reset your password for your GlobeTrotter account. If you didn't make this request, you can safely ignore this email.</p>
            
            <p>To reset your password, click the button below:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <div class="warning">
              <strong>Important:</strong> This link will expire in 1 hour for security reasons.
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
          </div>
          
          <div class="footer">
            <p>This email was sent from GlobeTrotter. If you have any questions, please contact our support team.</p>
            <p>&copy; 2024 GlobeTrotter. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Reset Your GlobeTrotter Password
      
      Hello ${userName || 'there'},
      
      We received a request to reset your password for your GlobeTrotter account. If you didn't make this request, you can safely ignore this email.
      
      To reset your password, visit this link:
      ${resetUrl}
      
      This link will expire in 1 hour for security reasons.
      
      Best regards,
      The GlobeTrotter Team
    `
  }),
  
  itineraryShare: (trip, sender, shareUrl) => ({
    subject: `Trip Itinerary: ${trip.name} - Shared by ${sender.name}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Trip Itinerary Shared</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }
          .container {
            background: white;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
          }
          .logo-text {
            color: white;
            font-size: 24px;
            font-weight: bold;
          }
          h1 {
            color: #333;
            margin: 0;
            font-size: 28px;
          }
          .content {
            margin: 30px 0;
          }
          .trip-card {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            border-left: 4px solid #3b82f6;
          }
          .trip-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 15px;
          }
          .detail-item {
            background: white;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }
          .detail-label {
            font-weight: bold;
            color: #374151;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .detail-value {
            color: #1f2937;
            margin-top: 4px;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin: 20px 0;
            transition: transform 0.2s;
          }
          .button:hover {
            transform: translateY(-2px);
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
          }
          .attachment-note {
            background: #e0f2fe;
            border: 1px solid #81d4fa;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #0277bd;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <span class="logo-text">GT</span>
            </div>
            <h1>Trip Itinerary Shared</h1>
          </div>
          
          <div class="content">
            <p>Hello!</p>
            <p><strong>${sender.name}</strong> has shared a trip itinerary with you from GlobeTrotter.</p>
            
            <div class="trip-card">
              <h3 style="color: #1f2937; margin-bottom: 10px; font-size: 20px;">${trip.name}</h3>
              <p style="color: #6b7280; margin-bottom: 15px;">${trip.description || 'No description provided'}</p>
              
              <div class="trip-details">
                <div class="detail-item">
                  <div class="detail-label">Destination</div>
                  <div class="detail-value">${trip.destinationCity}, ${trip.destinationCountry}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Dates</div>
                  <div class="detail-value">${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Total Budget</div>
                  <div class="detail-value">$${trip.totalBudget?.toFixed(2) || '0.00'}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Estimated Cost</div>
                  <div class="detail-value">$${trip.estimatedCost?.toFixed(2) || '0.00'}</div>
                </div>
              </div>
            </div>
            
            <div class="attachment-note">
              <strong>📎 Attachment:</strong> A complete PDF version of this itinerary is attached to this email.
            </div>
            
            <p>You can also view it online by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${shareUrl}" class="button">View Online</a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              This itinerary was shared with you via GlobeTrotter's sharing feature.
            </p>
          </div>
          
          <div class="footer">
            <p>This email was sent from GlobeTrotter. If you have any questions, please contact our support team.</p>
            <p>&copy; 2024 GlobeTrotter. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Trip Itinerary: ${trip.name} - Shared by ${sender.name}
      
      Hello!
      
      ${sender.name} has shared a trip itinerary with you from GlobeTrotter.
      
      Trip Details:
      - Name: ${trip.name}
      - Destination: ${trip.destinationCity}, ${trip.destinationCountry}
      - Dates: ${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}
      - Total Budget: $${trip.totalBudget?.toFixed(2) || '0.00'}
      - Estimated Cost: $${trip.estimatedCost?.toFixed(2) || '0.00'}
      - Description: ${trip.description || 'No description provided'}
      
      A complete PDF version of this itinerary is attached to this email.
      
      You can also view it online at: ${shareUrl}
      
      Best regards,
      The GlobeTrotter Team
    `
  })
};

// Send email function
const sendEmail = async (to, template, data = {}) => {
  try {
    const emailContent = emailTemplates[template](data.resetUrl, data.userName);
    
    const mailOptions = {
      from: '"GlobeTrotter" <deepak23188@iiitd.ac.in>',
      to: to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send custom email function with attachments support
const sendCustomEmail = async (emailOptions) => {
  try {
    const mailOptions = {
      from: '"GlobeTrotter" <deepak23188@iiitd.ac.in>',
      to: emailOptions.to,
      subject: emailOptions.subject,
      html: emailOptions.html,
      text: emailOptions.text || '',
      attachments: emailOptions.attachments || []
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Custom email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Custom email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email configuration is valid');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendCustomEmail,
  verifyEmailConfig,
  emailTemplates
};
