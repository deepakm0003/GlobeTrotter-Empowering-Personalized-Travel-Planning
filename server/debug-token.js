const jwt = require('jsonwebtoken');

// Debug JWT token issues
function debugToken() {
  console.log('🔧 Debugging JWT token issues...');
  
  // Test the exact token from the logs
  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWU3bDR5dzgwMDBheTViODh5NTczdXFuIiwiZW1haWwiOiJkZWVwYWtieWFkMTIzNEBnbWFpbC5jb20iLCJuYW1lIjoiRGVlcGFrIG1lZW5hIiwiaWF0IjoxNzU0OTQ2OTYzLCJleHAiOjE3NTU1NTE3NjN9.9MioyarIRr3M9eZmnk2c_YOlQrD3BDUHG90RvzA0uSA';
  
  const secret = 'your-super-secret-jwt-key-for-globetrotter-app-2024';
  
  try {
    console.log('📤 Attempting to verify token...');
    const decoded = jwt.verify(testToken, secret);
    console.log('✅ Token verified successfully!');
    console.log('Decoded payload:', decoded);
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    
    // Try to decode without verification to see the payload
    try {
      const decodedWithoutVerification = jwt.decode(testToken);
      console.log('📋 Token payload (without verification):', decodedWithoutVerification);
    } catch (decodeError) {
      console.error('❌ Could not decode token:', decodeError.message);
    }
  }
  
  // Test with the old secret
  const oldSecret = 'your-secret-key';
  try {
    console.log('📤 Testing with old secret...');
    const decoded = jwt.verify(testToken, oldSecret);
    console.log('✅ Token works with old secret!');
  } catch (error) {
    console.log('❌ Token does not work with old secret:', error.message);
  }
}

// Run the debug
debugToken();
