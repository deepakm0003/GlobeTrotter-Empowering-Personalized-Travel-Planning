const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testForgotPassword() {
  try {
    console.log('🧪 Testing Forgot Password Functionality...\n');

    console.log('1. Testing forgot password request...');
    const forgotResponse = await fetch('http://localhost:4000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sarah@example.com' })
    });

    const forgotData = await forgotResponse.json();
    console.log('Response:', forgotData);

    if (forgotData.resetUrl) {
      console.log('✅ Password reset URL generated successfully!');
      console.log('Reset URL:', forgotData.resetUrl);
      
      // Extract token from URL
      const token = forgotData.resetUrl.split('token=')[1];
      console.log('Token:', token);

      // Test 2: Reset password with the token
      console.log('\n2. Testing password reset...');
      const resetResponse = await fetch('http://localhost:4000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: token, 
          password: 'newpassword123' 
        })
      });

      const resetData = await resetResponse.json();
      console.log('Reset Response:', resetData);

      if (resetResponse.ok) {
        console.log('✅ Password reset successful!');
        
        // Test 3: Try to login with new password
        console.log('\n3. Testing login with new password...');
        const loginResponse = await fetch('http://localhost:4000/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: 'sarah@example.com', 
            password: 'newpassword123' 
          })
        });

        const loginData = await loginResponse.json();
        console.log('Login Response:', loginData);

        if (loginResponse.ok) {
          console.log('✅ Login with new password successful!');
          console.log('\n🎉 Forgot password functionality is working perfectly!');
        } else {
          console.log('❌ Login with new password failed');
        }
      } else {
        console.log('❌ Password reset failed');
      }
    } else {
      console.log('❌ No reset URL received');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testForgotPassword();
