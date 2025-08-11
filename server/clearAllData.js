const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAllData() {
  try {
    console.log('🗑️ Clearing all data from database...\n');
    
    // Delete all trips first (due to foreign key constraints)
    const deletedTrips = await prisma.trip.deleteMany({});
    console.log(`✅ Deleted ${deletedTrips.count} trips`);
    
    // Delete all users
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`✅ Deleted ${deletedUsers.count} users`);
    
    // Note: We keep cities and activities as they are reference data
    const cities = await prisma.city.findMany();
    const activities = await prisma.activity.findMany();
    
    console.log(`\n📊 Database Status:`);
    console.log(`  - Users: 0`);
    console.log(`  - Trips: 0`);
    console.log(`  - Cities: ${cities.length} (reference data)`);
    console.log(`  - Activities: ${activities.length} (reference data)`);
    
    console.log('\n✅ Database is now completely clean!');
    console.log('🎯 New users can now sign up and start with a fresh experience.');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllData();
