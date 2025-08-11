const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  const baseUrl = 'http://localhost:4000';
  
  try {
    console.log('🧪 Testing API endpoints...\n');
    
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    console.log('✅ Health check:', healthData);
    
    // Test 2: Dashboard without user ID (should fail)
    console.log('\n2. Testing dashboard without user ID...');
    try {
      const dashboardRes = await fetch(`${baseUrl}/api/dashboard`);
      const dashboardData = await dashboardRes.json();
      console.log('❌ Dashboard should have failed but returned:', dashboardData);
    } catch (error) {
      console.log('✅ Dashboard correctly rejected request without user ID');
    }
    
    // Test 3: Trips without user ID (should fail)
    console.log('\n3. Testing trips without user ID...');
    try {
      const tripsRes = await fetch(`${baseUrl}/api/trips`);
      const tripsData = await tripsRes.json();
      console.log('❌ Trips should have failed but returned:', tripsData);
    } catch (error) {
      console.log('✅ Trips correctly rejected request without user ID');
    }
    
    // Test 4: Dashboard with fake user ID
    console.log('\n4. Testing dashboard with fake user ID...');
    const fakeUserId = 'fake-user-id';
    const dashboardWithUserRes = await fetch(`${baseUrl}/api/dashboard?userId=${fakeUserId}`);
    const dashboardWithUserData = await dashboardWithUserRes.json();
    console.log('✅ Dashboard with fake user ID:', dashboardWithUserData);
    
    // Test 5: Trips with fake user ID
    console.log('\n5. Testing trips with fake user ID...');
    const tripsWithUserRes = await fetch(`${baseUrl}/api/trips?userId=${fakeUserId}`);
    const tripsWithUserData = await tripsWithUserRes.json();
    console.log('✅ Trips with fake user ID:', tripsWithUserData);
    
    console.log('\n🎉 API tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAPI();
