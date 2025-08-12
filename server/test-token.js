const jwt = require('jsonwebtoken');

// Test JWT token functionality
function testJWT() {
  console.log('🔧 Testing JWT token functionality...');
  
  const secret = 'your-super-secret-jwt-key-for-globetrotter-app-2024';
  
  // Test data
  const testUser = {
    userId: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User'
  };
  
  try {
    // Generate a token
    console.log('📤 Generating JWT token...');
    const token = jwt.sign(testUser, secret, { expiresIn: '7d' });
    console.log('✅ Token generated:', token.substring(0, 50) + '...');
    
    // Verify the token
    console.log('📤 Verifying JWT token...');
    const decoded = jwt.verify(token, secret);
    console.log('✅ Token verified successfully!');
    console.log('Decoded payload:', decoded);
    
    // Test with wrong secret (should fail)
    console.log('📤 Testing with wrong secret...');
    try {
      jwt.verify(token, 'wrong-secret');
      console.log('❌ This should have failed!');
    } catch (error) {
      console.log('✅ Correctly failed with wrong secret:', error.message);
    }
    
    console.log('');
    console.log('🎉 JWT functionality is working correctly!');
    
  } catch (error) {
    console.error('❌ JWT test failed:', error);
  }
}

// Run the test
testJWT();
