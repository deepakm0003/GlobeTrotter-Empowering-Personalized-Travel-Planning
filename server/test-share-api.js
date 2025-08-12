const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Test the share-email API endpoint
async function testShareEmailAPI() {
  try {
    console.log('🔧 Testing share-email API endpoint...');
    
    // First, let's get a real trip from the database
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
    
    // Test the API endpoint
    const response = await fetch('http://localhost:3000/api/trips/share-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${trip.user.id}` // Using user ID as simple auth for testing
      },
      body: JSON.stringify({
        tripId: trip.id,
        recipientEmail: 'deepak23188@iiitd.ac.in', // Send to yourself for testing
        senderId: trip.userId
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Share email API call successful!');
      console.log('Response:', result);
    } else {
      console.log('❌ Share email API call failed');
      console.log('Status:', response.status);
      console.log('Error:', result);
    }
    
  } catch (error) {
    console.error('❌ Error testing share email API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testShareEmailAPI();
