// Demo email configuration for testing without real email setup
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
          .demo-notice {
            background: #e3f2fd;
            border: 1px solid #2196f3;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            color: #1976d2;
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
          
          <div class="demo-notice">
            <strong>DEMO MODE:</strong> This is a simulated email. In production, this would be sent to your email address.
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
      Reset Your GlobeTrotter Password (DEMO MODE)
      
      Hello ${userName || 'there'},
      
      We received a request to reset your password for your GlobeTrotter account. If you didn't make this request, you can safely ignore this email.
      
      To reset your password, visit this link:
      ${resetUrl}
      
      This link will expire in 1 hour for security reasons.
      
      Best regards,
      The GlobeTrotter Team
    `
  })
};

// Demo send email function
const sendEmail = async (to, template, data = {}) => {
  try {
    const emailContent = emailTemplates[template](data.resetUrl, data.userName);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('📧 DEMO EMAIL SENT:');
    console.log('To:', to);
    console.log('Subject:', emailContent.subject);
    console.log('Reset URL:', data.resetUrl);
    console.log('HTML Preview:', emailContent.html.substring(0, 200) + '...');
    
    return { 
      success: true, 
      messageId: 'demo-' + Date.now(),
      demo: true
    };
  } catch (error) {
    console.error('Demo email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Demo verify email configuration
const verifyEmailConfig = async () => {
  console.log('✅ Demo email configuration is valid (simulated)');
  return true;
};

module.exports = {
  sendEmail,
  verifyEmailConfig,
  emailTemplates
};
