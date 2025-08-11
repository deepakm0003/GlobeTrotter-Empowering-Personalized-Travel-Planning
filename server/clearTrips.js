const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAllTrips() {
  try {
    console.log('🗑️ Clearing all trips from database...');
    
    // Delete all trips
    const deletedTrips = await prisma.trip.deleteMany({});
    
    console.log(`✅ Deleted ${deletedTrips.count} trips from database`);
    console.log('✅ Database is now clean - no hardcoded trips');
    
  } catch (error) {
    console.error('❌ Error clearing trips:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllTrips();
