const fetch = require('node-fetch');

async function testCalendarIntegration() {
  console.log('🧪 Testing Calendar Integration...\n');

  try {
    // Step 1: Create a test trip first
    console.log('1. Creating a test trip...');
    const tripResponse = await fetch('http://localhost:4000/api/trips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user-123'
      },
      body: JSON.stringify({
        name: 'Test Trip for Calendar',
        description: 'A test trip to verify calendar functionality',
        startDate: '2025-08-20',
        endDate: '2025-08-30',
        destinationCity: 'Paris',
        destinationCountry: 'France',
        totalBudget: 1000,
        estimatedCost: 800
      })
    });

    const tripData = await tripResponse.json();
    console.log('Trip created:', tripData);

    if (!tripData.id) {
      console.log('❌ Failed to create trip');
      return;
    }

    // Step 2: Add a calendar event
    console.log('\n2. Adding a calendar event...');
    const eventResponse = await fetch('http://localhost:4000/api/calendar/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user-123'
      },
      body: JSON.stringify({
        tripId: tripData.id,
        stopId: 'default-stop',
        name: 'Visit Eiffel Tower',
        description: 'Tour the famous landmark',
        date: '2025-08-25',
        duration: 3,
        cost: 25,
        category: 'sightseeing'
      })
    });

    const eventData = await eventResponse.json();
    console.log('Event created:', eventData);

    // Step 3: Fetch trips to see if the event appears
    console.log('\n3. Fetching trips to verify event appears...');
    const tripsResponse = await fetch('http://localhost:4000/api/trips/my?userId=test-user-123');
    const tripsData = await tripsResponse.json();
    
    console.log('Trips with activities:', JSON.stringify(tripsData, null, 2));

    // Check if the event appears in the trip
    const testTrip = tripsData.find(trip => trip.id === tripData.id);
    if (testTrip && testTrip.stops && testTrip.stops.length > 0) {
      const activities = testTrip.stops.flatMap(stop => stop.activities || []);
      console.log('\n✅ Found activities:', activities.length);
      activities.forEach(activity => {
        console.log(`  - ${activity.name} (${activity.date})`);
      });
    } else {
      console.log('\n❌ No activities found in trip');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCalendarIntegration();
