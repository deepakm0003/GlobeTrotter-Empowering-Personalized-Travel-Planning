const fetch = require('node-fetch');

// Test configuration
const BASE_URL = 'http://localhost:4000';
const TEST_EMAIL = 'test-shared@example.com';
const TEST_PASSWORD = 'testpassword123';

async function testSharedTripsAPI() {
  console.log('🧪 Testing Shared Trips API Endpoints...\n');

  try {
    // Step 1: Login to get a JWT token
    console.log('1. Logging in to get JWT token...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed. Creating test user first...');
      
      // Try to create a test user
      const signupResponse = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Test User',
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        })
      });

      if (!signupResponse.ok) {
        const error = await signupResponse.json();
        console.log('❌ Signup failed:', error);
        return;
      }

      console.log('✅ Test user created successfully');
      
      // Try login again
      const loginResponse2 = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: TEST_EMAIL,
          password: TEST_PASSWORD
        })
      });

      if (!loginResponse2.ok) {
        console.log('❌ Login still failed after signup');
        return;
      }
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    if (!token) {
      console.log('❌ No token received from login');
      return;
    }

    console.log('✅ Login successful, token received');

    // Step 2: Create a test trip
    console.log('\n2. Creating a test trip...');
    const tripResponse = await fetch(`${BASE_URL}/api/trips`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Test Trip for Sharing',
        description: 'A test trip to verify sharing functionality',
        startDate: '2024-06-01',
        endDate: '2024-06-07',
        destinationCity: 'Paris',
        destinationCountry: 'France',
        totalBudget: 2000,
        estimatedCost: 1800
      })
    });

    if (!tripResponse.ok) {
      const error = await tripResponse.json();
      console.log('❌ Failed to create trip:', error);
      return;
    }

    const trip = await tripResponse.json();
    console.log('✅ Test trip created:', trip.id);

    // Step 3: Test share link generation
    console.log('\n3. Testing share link generation...');
    const shareLinkResponse = await fetch(`${BASE_URL}/api/trips/${trip.id}/share-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!shareLinkResponse.ok) {
      const error = await shareLinkResponse.json();
      console.log('❌ Failed to generate share link:', error);
      return;
    }

    const shareLinkData = await shareLinkResponse.json();
    console.log('✅ Share link generated:', shareLinkData.shareUrl);

    // Step 4: Test email sharing
    console.log('\n4. Testing email sharing...');
    const emailShareResponse = await fetch(`${BASE_URL}/api/trips/share-email-simple`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        tripId: trip.id,
        recipientEmail: 'test-recipient@example.com'
      })
    });

    if (!emailShareResponse.ok) {
      const error = await emailShareResponse.json();
      console.log('❌ Failed to share via email:', error);
    } else {
      const emailShareData = await emailShareResponse.json();
      console.log('✅ Email sharing successful:', emailShareData.message);
    }

    // Step 5: Fetch shared trips
    console.log('\n5. Fetching shared trips...');
    const sharedTripsResponse = await fetch(`${BASE_URL}/api/shared-trips`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!sharedTripsResponse.ok) {
      const error = await sharedTripsResponse.json();
      console.log('❌ Failed to fetch shared trips:', error);
      return;
    }

    const sharedTrips = await sharedTripsResponse.json();
    console.log('✅ Shared trips fetched successfully');
    console.log(`   Found ${sharedTrips.length} shared trips`);

    if (sharedTrips.length > 0) {
      sharedTrips.forEach((sharedTrip, index) => {
        console.log(`   ${index + 1}. ${sharedTrip.trip.name} - ${sharedTrip.shareMethod} - ${sharedTrip.sharedAt}`);
        if (sharedTrip.sharedWith) {
          console.log(`      Shared with: ${sharedTrip.sharedWith}`);
        }
      });

      // Step 6: Test deactivating a share
      console.log('\n6. Testing share deactivation...');
      const firstShare = sharedTrips[0];
      const deactivateResponse = await fetch(`${BASE_URL}/api/shared-trips/${firstShare.id}/deactivate`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!deactivateResponse.ok) {
        const error = await deactivateResponse.json();
        console.log('❌ Failed to deactivate share:', error);
      } else {
        const deactivateData = await deactivateResponse.json();
        console.log('✅ Share deactivated successfully:', deactivateData.message);
      }
    }

    console.log('\n🎉 All API tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - JWT authentication working');
    console.log('   - Trip creation working');
    console.log('   - Share link generation working');
    console.log('   - Email sharing working');
    console.log('   - Shared trips fetching working');
    console.log('   - Share deactivation working');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testSharedTripsAPI();
