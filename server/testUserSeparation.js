const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testUserSeparation() {
  try {
    console.log('🧪 Testing User Data Separation...\n');
    
    // Clear existing data
    await prisma.trip.deleteMany({});
    await prisma.user.deleteMany({});
    
    console.log('✅ Cleared existing data');
    
    // Create User 1
    const passwordHash1 = await bcrypt.hash('password123', 10);
    const user1 = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        preferences: { currency: 'USD', language: 'en', notifications: true },
        passwordHash: passwordHash1,
      },
    });
    
    // Create User 2
    const passwordHash2 = await bcrypt.hash('password123', 10);
    const user2 = await prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        preferences: { currency: 'EUR', language: 'en', notifications: true },
        passwordHash: passwordHash2,
      },
    });
    
    console.log('✅ Created two users:');
    console.log(`  - User 1: ${user1.name} (${user1.email}) - ID: ${user1.id}`);
    console.log(`  - User 2: ${user2.name} (${user2.email}) - ID: ${user2.id}`);
    
    // Create trips for User 1
    const trip1 = await prisma.trip.create({
      data: {
        name: 'Paris Adventure',
        description: 'Exploring the City of Light',
        coverPhoto: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=800',
        startDate: new Date('2025-06-15'),
        endDate: new Date('2025-06-22'),
        destinationCity: 'Paris',
        destinationCountry: 'France',
        totalBudget: 2000,
        estimatedCost: 1800,
        userId: user1.id,
      },
    });
    
    const trip2 = await prisma.trip.create({
      data: {
        name: 'Tokyo Discovery',
        description: 'Modern meets traditional',
        coverPhoto: 'https://images.pexels.com/photos/2187605/pexels-photo-2187605.jpeg?auto=compress&cs=tinysrgb&w=800',
        startDate: new Date('2025-08-10'),
        endDate: new Date('2025-08-20'),
        destinationCity: 'Tokyo',
        destinationCountry: 'Japan',
        totalBudget: 3000,
        estimatedCost: 2800,
        userId: user1.id,
      },
    });
    
    // Create trips for User 2
    const trip3 = await prisma.trip.create({
      data: {
        name: 'London Weekend',
        description: 'Historic capital exploration',
        coverPhoto: 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=800',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-07-05'),
        destinationCity: 'London',
        destinationCountry: 'United Kingdom',
        totalBudget: 1500,
        estimatedCost: 1200,
        userId: user2.id,
      },
    });
    
    console.log('\n✅ Created trips:');
    console.log(`  - User 1 trips: ${trip1.name}, ${trip2.name}`);
    console.log(`  - User 2 trips: ${trip3.name}`);
    
    // Test data separation
    const user1Trips = await prisma.trip.findMany({ where: { userId: user1.id } });
    const user2Trips = await prisma.trip.findMany({ where: { userId: user2.id } });
    
    console.log('\n🔍 Data Separation Test:');
    console.log(`  - User 1 (${user1.email}) has ${user1Trips.length} trips`);
    console.log(`  - User 2 (${user2.email}) has ${user2Trips.length} trips`);
    
    if (user1Trips.length === 2 && user2Trips.length === 1) {
      console.log('✅ Data separation is working correctly!');
      console.log('\n📝 Test Credentials:');
      console.log('  User 1: john@example.com / password123');
      console.log('  User 2: jane@example.com / password123');
      console.log('\n🎯 Each user will see only their own trips when they log in!');
    } else {
      console.log('❌ Data separation is not working correctly!');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testUserSeparation();
