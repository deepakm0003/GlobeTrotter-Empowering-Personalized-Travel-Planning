const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function simpleTest() {
  try {
    console.log('Testing server connection...');
    
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:4000/api/health');
    const healthText = await healthResponse.text();
    console.log('Health response:', healthText);
    
    // Test forgot password
    const forgotResponse = await fetch('http://localhost:4000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sarah@example.com' })
    });
    
    const forgotText = await forgotResponse.text();
    console.log('Forgot password response:', forgotText);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

simpleTest();
