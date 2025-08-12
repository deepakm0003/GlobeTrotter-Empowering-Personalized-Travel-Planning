// Test script for link sharing functionality
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testLinkSharing() {
  console.log('🧪 Testing Link Sharing Functionality\n');

  try {
    // Step 1: Test JWT token endpoint
    console.log('1️⃣ Testing JWT token endpoint...');
    
    // Using the provided JWT token
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30';

    const jwtResponse = await fetch(`${BASE_URL}/api/test-jwt`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
      },
    });

    console.log('JWT Response status:', jwtResponse.status);

    if (jwtResponse.ok) {
      const jwtData = await jwtResponse.json();
      console.log('✅ JWT token is valid');
      console.log('User ID from token:', jwtData.userId);
      console.log('User object:', jwtData.user);
    } else {
      console.log('❌ JWT token is invalid');
      const error = await jwtResponse.json();
      console.log('Error:', error);
      return;
    }

    // Step 2: Get user's trips
    console.log('\n2️⃣ Getting user trips...');
    
    const tripsResponse = await fetch(`${BASE_URL}/api/trips/my`, {
      headers: {
        'Authorization': `Bearer ${testToken}`,
      },
    });

    console.log('Trips Response status:', tripsResponse.status);

    if (tripsResponse.ok) {
      const trips = await tripsResponse.json();
      console.log(`✅ Found ${trips.length} trips`);
      
      if (trips.length === 0) {
        console.log('❌ No trips found. Please create a trip first.');
        return;
      }

      const testTrip = trips[0];
      console.log('Using trip for testing:', testTrip.name);
      console.log('Trip ID:', testTrip.id);
      console.log('Is Public:', testTrip.isPublic);

      // Step 3: Test link sharing
      console.log('\n3️⃣ Testing link sharing...');
      
      const shareResponse = await fetch(`${BASE_URL}/api/trips/${testTrip.id}/share-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testToken}`,
        },
      });

      console.log('Share response status:', shareResponse.status);

      if (shareResponse.ok) {
        const shareResult = await shareResponse.json();
        console.log('✅ Link sharing successful!');
        console.log('Share URL:', shareResult.shareUrl);
        console.log('Shared Trip ID:', shareResult.sharedTripId);
        console.log('Message:', shareResult.message);
      } else {
        const error = await shareResponse.json();
        console.log('❌ Link sharing failed:');
        console.log('Error:', error);
      }

      // Step 4: Check if trip is now public
      console.log('\n4️⃣ Checking if trip is now public...');
      
      const updatedTripResponse = await fetch(`${BASE_URL}/api/trips/${testTrip.id}`, {
        headers: {
          'Authorization': `Bearer ${testToken}`,
        },
      });

      if (updatedTripResponse.ok) {
        const updatedTrip = await updatedTripResponse.json();
        console.log('Updated trip public status:', updatedTrip.isPublic);
      }

      // Step 5: Check shared trips list
      console.log('\n5️⃣ Checking shared trips list...');
      
      const sharedTripsResponse = await fetch(`${BASE_URL}/api/shared-trips`, {
        headers: {
          'Authorization': `Bearer ${testToken}`,
        },
      });

      if (sharedTripsResponse.ok) {
        const sharedTrips = await sharedTripsResponse.json();
        console.log(`✅ Found ${sharedTrips.length} shared trips`);
        if (sharedTrips.length > 0) {
          console.log('Latest shared trip:', sharedTrips[0]);
        }
      }

    } else {
      console.log('❌ Failed to get trips');
      const error = await tripsResponse.json();
      console.log('Error:', error);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testLinkSharing();
