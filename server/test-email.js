const { sendEmail, verifyEmailConfig } = require('./config/email');

async function testEmailFunctionality() {
  console.log('🧪 Testing Email Functionality...\n');

  // Test 1: Verify email configuration
  console.log('1. Testing email configuration...');
  const configValid = await verifyEmailConfig();
  
  if (!configValid) {
    console.log('❌ Email configuration is invalid. Please check your Gmail settings.');
    console.log('📝 Follow the setup guide in setup-email.md');
    return;
  }

  console.log('✅ Email configuration is valid!\n');

  // Test 2: Send test email
  console.log('2. Sending test email...');
  
  const testData = {
    resetUrl: 'http://localhost:5174/reset-password?token=test-token-123',
    userName: 'Test User'
  };

  const result = await sendEmail('deepak23188@iiitd.ac.in', 'passwordReset', testData);

  if (result.success) {
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', result.messageId);
    console.log('\n🎉 Email functionality is working perfectly!');
    console.log('\n📝 To use in production:');
    console.log('1. Update email configuration in config/email.js');
    console.log('2. Replace test@example.com with your actual email');
    console.log('3. Test with a real email address');
  } else {
    console.log('❌ Failed to send test email:', result.error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your Gmail app password');
    console.log('2. Ensure 2FA is enabled on your Gmail account');
    console.log('3. Verify the email configuration in config/email.js');
  }
}

testEmailFunctionality();
