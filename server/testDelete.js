const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDelete() {
  try {
    // First, let's see what trips exist
    const trips = await prisma.trip.findMany();
    console.log('All trips:', trips);

    if (trips.length > 0) {
      const firstTrip = trips[0];
      console.log('Attempting to delete trip:', firstTrip.id);
      
      await prisma.trip.delete({
        where: { id: firstTrip.id }
      });
      
      console.log('Trip deleted successfully');
    } else {
      console.log('No trips found to delete');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDelete();
