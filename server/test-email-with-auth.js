const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Test email sharing with proper authentication
async function testEmailSharingWithAuth() {
  try {
    console.log('🔧 Testing email sharing with authentication...');
    
    // Get a real trip from the database
    const trip = await prisma.trip.findFirst({
      include: {
        user: true
      }
    });
    
    if (!trip) {
      console.log('❌ No trips found in database. Please create a trip first.');
      return;
    }
    
    console.log('✅ Found trip:', trip.name);
    console.log('Trip ID:', trip.id);
    console.log('User:', trip.user.name);
    console.log('User ID:', trip.user.id);
    
    // Generate a JWT token for the user
    const secret = 'your-super-secret-jwt-key-for-globetrotter-app-2024';
    const token = jwt.sign(
      { 
        userId: trip.user.id, 
        email: trip.user.email,
        name: trip.user.name 
      },
      secret,
      { expiresIn: '7d' }
    );
    
    console.log('✅ JWT token generated for user');
    
    // Test the email sharing API endpoint with authentication
    console.log('📤 Testing email sharing API...');
    
    const response = await fetch('http://localhost:4000/api/trips/share-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        tripId: trip.id,
        recipientEmail: 'deepak23188@iiitd.ac.in' // Send to yourself for testing
      })
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Email sharing API call successful!');
      console.log('Response:', result);
      console.log('');
      console.log('🎉 Email sharing with authentication is working correctly!');
      console.log('');
      console.log('The email sharing includes:');
      console.log('✅ Proper JWT authentication');
      console.log('✅ User ID verification');
      console.log('✅ Trip ownership verification');
      console.log('✅ PDF generation and email sending');
    } else {
      const error = await response.json();
      console.log('❌ Email sharing API call failed');
      console.log('Error:', error);
    }
    
  } catch (error) {
    console.error('❌ Error testing email sharing with auth:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testEmailSharingWithAuth();
