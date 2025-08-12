const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testBudget() {
  try {
    console.log('🧪 Testing budget functionality...');

    // Get the test user
    const user = await prisma.user.findFirst({
      where: { email: 'deepak23188@iiitd.ac.in' }
    });

    if (!user) {
      console.log('❌ Test user not found. Please run the seed script first.');
      return;
    }

    console.log('✅ Found test user:', user.name);

    // Create a test trip
    const trip = await prisma.trip.create({
      data: {
        name: 'Test Budget Trip',
        description: 'A test trip for budget functionality',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-20'),
        destinationCity: 'Paris',
        destinationCountry: 'France',
        totalBudget: 2000,
        estimatedCost: 1800,
        userId: user.id,
      }
    });

    console.log('✅ Created test trip:', trip.name);

    // Add some budget items
    const budgetItems = [
      {
        tripId: trip.id,
        category: 'accommodation',
        description: 'Hotel booking for 5 nights',
        amount: 800,
        date: new Date('2024-01-15')
      },
      {
        tripId: trip.id,
        category: 'transport',
        description: 'Flight tickets',
        amount: 400,
        date: new Date('2024-01-15')
      },
      {
        tripId: trip.id,
        category: 'activities',
        description: 'Eiffel Tower tickets',
        amount: 50,
        date: new Date('2024-01-16')
      },
      {
        tripId: trip.id,
        category: 'meals',
        description: 'Dinner at restaurant',
        amount: 80,
        date: new Date('2024-01-16')
      },
      {
        tripId: trip.id,
        category: 'other',
        description: 'Souvenirs',
        amount: 30,
        date: new Date('2024-01-17')
      }
    ];

    for (const item of budgetItems) {
      await prisma.budgetItem.create({
        data: item
      });
    }

    console.log('✅ Added', budgetItems.length, 'budget items');

    // Fetch and display budget items
    const fetchedItems = await prisma.budgetItem.findMany({
      where: { tripId: trip.id },
      orderBy: { date: 'asc' }
    });

    console.log('\n📊 Budget Items:');
    fetchedItems.forEach(item => {
      console.log(`- ${item.category}: $${item.amount} (${item.description})`);
    });

    // Calculate total spent
    const totalSpent = fetchedItems.reduce((sum, item) => sum + item.amount, 0);
    console.log(`\n💰 Total Spent: $${totalSpent}`);
    console.log(`🎯 Budget: $${trip.totalBudget}`);
    console.log(`📈 Remaining: $${trip.totalBudget - totalSpent}`);

    console.log('\n✅ Budget test completed successfully!');
    console.log(`🔗 You can now test the budget page with trip ID: ${trip.id}`);

  } catch (error) {
    console.error('❌ Error testing budget:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBudget();
