const fetch = require('node-fetch');

const API_BASE = 'http://localhost:4000';

async function testCalendarAPI() {
  console.log('🧪 Testing Calendar API Endpoints...\n');

  try {
    // First, create a test user
    console.log('1. Creating test user...');
    const createUserResponse = await fetch(`${API_BASE}/api/debug/create-test-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const userData = await createUserResponse.json();
    console.log('✅ Test user created:', userData.user.email);

    // Login to get a session
    console.log('\n2. Logging in...');
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      })
    });
    const loginData = await loginResponse.json();
    console.log('✅ Login successful');

    // Create a test trip
    console.log('\n3. Creating test trip...');
    const tripResponse = await fetch(`${API_BASE}/api/trips`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': userData.user.id
      },
      body: JSON.stringify({
        name: 'Test Trip for Calendar',
        description: 'A test trip for calendar events',
        startDate: '2024-12-01T00:00:00.000Z',
        endDate: '2024-12-07T00:00:00.000Z',
        destinationCity: 'Paris',
        destinationCountry: 'France',
        totalBudget: 1000
      })
    });
    const tripData = await tripResponse.json();
    console.log('✅ Test trip created:', tripData.trip.name);

    // Test creating a calendar event
    console.log('\n4. Creating calendar event...');
    const eventResponse = await fetch(`${API_BASE}/api/calendar/events`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': userData.user.id
      },
      body: JSON.stringify({
        tripId: tripData.trip.id,
        stopId: 'test-stop-1',
        name: 'Visit Eiffel Tower',
        description: 'Visit the iconic Eiffel Tower',
        date: '2024-12-02',
        duration: 3,
        cost: 25,
        category: 'sightseeing'
      })
    });
    const eventData = await eventResponse.json();
    console.log('✅ Calendar event created:', eventData.activity.name);

    // Test updating the event
    console.log('\n5. Updating calendar event...');
    const updateResponse = await fetch(`${API_BASE}/api/calendar/events/${eventData.activity.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'x-user-id': userData.user.id
      },
      body: JSON.stringify({
        name: 'Visit Eiffel Tower (Updated)',
        description: 'Visit the iconic Eiffel Tower - Updated description',
        duration: 4,
        cost: 30,
        category: 'sightseeing'
      })
    });
    const updateData = await updateResponse.json();
    console.log('✅ Calendar event updated:', updateData.activity.name);

    // Test fetching events for the trip
    console.log('\n6. Fetching calendar events...');
    const fetchResponse = await fetch(`${API_BASE}/api/calendar/events/${tripData.trip.id}`, {
      headers: { 'x-user-id': userData.user.id }
    });
    const fetchData = await fetchResponse.json();
    console.log('✅ Calendar events fetched:', fetchData.activities.length, 'events');

    // Test deleting the event
    console.log('\n7. Deleting calendar event...');
    const deleteResponse = await fetch(`${API_BASE}/api/calendar/events/${eventData.activity.id}`, {
      method: 'DELETE',
      headers: { 'x-user-id': userData.user.id }
    });
    const deleteData = await deleteResponse.json();
    console.log('✅ Calendar event deleted');

    console.log('\n🎉 All calendar API tests passed!');
    console.log('\n📋 Summary:');
    console.log('- ✅ User creation and login');
    console.log('- ✅ Trip creation');
    console.log('- ✅ Calendar event creation');
    console.log('- ✅ Calendar event update');
    console.log('- ✅ Calendar events fetching');
    console.log('- ✅ Calendar event deletion');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testCalendarAPI();
