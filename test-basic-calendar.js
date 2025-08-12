const fetch = require('node-fetch');

async function testBasicCalendar() {
  console.log('🧪 Testing Basic Calendar API...\n');

  try {
    // Test 1: Simple POST request
    console.log('1. Testing POST /api/calendar/events...');
    
    const testData = {
      tripId: 'test-trip-123',
      stopId: 'default-stop',
      name: 'Visit Eiffel Tower',
      description: 'Tour the famous landmark',
      date: '2025-08-25',
      duration: 3,
      cost: 25,
      category: 'sightseeing'
    };

    console.log('Sending data:', testData);

    const response = await fetch('http://localhost:4000/api/calendar/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user-123'
      },
      body: JSON.stringify(testData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());

    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (response.ok) {
      console.log('✅ Success! Event created.');
    } else {
      console.log('❌ Failed to create event.');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

testBasicCalendar();
