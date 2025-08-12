const fetch = require('node-fetch');

async function testCalendarAPI() {
  console.log('🧪 Testing Calendar API...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    const response = await fetch('http://localhost:4000/api/calendar/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user'
      },
      body: JSON.stringify({
        tripId: 'test-trip',
        stopId: 'default-stop',
        name: 'Test Event',
        description: 'Test Description',
        date: '2025-08-25',
        duration: 2,
        cost: 0,
        category: 'sightseeing'
      })
    });

    const data = await response.text();
    console.log('Response status:', response.status);
    console.log('Response data:', data);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCalendarAPI();
