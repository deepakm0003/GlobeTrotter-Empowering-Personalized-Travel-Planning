const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3001';

// Test data
const testTripId = 'cme7s212p0001y5iskpud6yez'; // Replace with actual trip ID
const testToken = 'your-jwt-token-here'; // Replace with actual token

async function testShareLink() {
  console.log('🧪 Testing Share Link Functionality...\n');

  try {
    // Test 1: Share Link Generation
    console.log('1️⃣ Testing share link generation...');
    
    const shareLinkResponse = await fetch(`${BASE_URL}/api/trips/${testTripId}/share-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`,
      },
    });

    console.log('Response status:', shareLinkResponse.status);
    
    if (shareLinkResponse.ok) {
      const result = await shareLinkResponse.json();
      console.log('✅ Share link generated successfully!');
      console.log('Result:', result);
    } else {
      const error = await shareLinkResponse.json();
      console.log('❌ Share link generation failed:');
      console.log('Error:', error);
    }

    // Test 2: Check if trip is now public
    console.log('\n2️⃣ Testing if trip is now public...');
    
    const tripResponse = await fetch(`${BASE_URL}/api/trips/${testTripId}`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
      },
    });

    if (tripResponse.ok) {
      const trip = await tripResponse.json();
      console.log('Trip public status:', trip.isPublic);
    }

    // Test 3: Check shared trips list
    console.log('\n3️⃣ Testing shared trips list...');
    
    const sharedTripsResponse = await fetch(`${BASE_URL}/api/shared-trips`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
      },
    });

    if (sharedTripsResponse.ok) {
      const sharedTrips = await sharedTripsResponse.json();
      console.log('Shared trips count:', sharedTrips.length);
      console.log('Latest shared trip:', sharedTrips[0]);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testShareLink();
