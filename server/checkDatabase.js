const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database state...\n');
    
    // Check users
    const users = await prisma.user.findMany();
    console.log(`👥 Users in database: ${users.length}`);
    users.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id})`);
    });
    
    // Check trips
    const trips = await prisma.trip.findMany({
      include: {
        user: true,
        stops: {
          include: {
            city: true
          }
        }
      }
    });
    console.log(`\n✈️ Trips in database: ${trips.length}`);
    trips.forEach(trip => {
      console.log(`  - "${trip.name}" (ID: ${trip.id}) - User: ${trip.user?.email || 'No user'}`);
    });
    
    // Check cities
    const cities = await prisma.city.findMany();
    console.log(`\n🏙️ Cities in database: ${cities.length}`);
    
    if (trips.length > 0) {
      console.log('\n⚠️  WARNING: There are still trips in the database!');
      console.log('   This means hardcoded data might still be showing.');
    } else {
      console.log('\n✅ Database is clean - no trips found');
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
