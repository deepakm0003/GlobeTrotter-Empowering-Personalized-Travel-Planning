const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAllData() {
  console.log('🗑️ Clearing all data from database...\n');

  try {
    // Delete all data in the correct order (respecting foreign key constraints)
    console.log('📝 Deleting all activities...');
    await prisma.activity.deleteMany({});
    
    console.log('🏙️ Deleting all cities...');
    await prisma.city.deleteMany({});
    
    console.log('✈️ Deleting all trips...');
    await prisma.trip.deleteMany({});
    
    console.log('🔑 Deleting all password resets...');
    await prisma.passwordReset.deleteMany({});
    
    console.log('👤 Deleting all users...');
    await prisma.user.deleteMany({});
    
    console.log('✅ All data cleared successfully!');
    console.log('\n💡 Next steps:');
    console.log('1. Run: npx prisma db seed');
    console.log('2. This will create clean data without duplicates');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllData();
