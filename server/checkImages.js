const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImages() {
  try {
    console.log('🔍 Checking database for cities and activities with images...\n');
    
    // Check cities
    const cities = await prisma.city.findMany({ take: 5 });
    console.log('🏙️  Cities with images:');
    cities.forEach(city => {
      console.log(`  ${city.name}: ${city.imageUrl ? '✅ Has image' : '❌ No image'}`);
      if (city.imageUrl) {
        console.log(`    URL: ${city.imageUrl}`);
      }
    });
    
    console.log('\n🎯 Activities with images:');
    const activities = await prisma.activity.findMany({ take: 5 });
    activities.forEach(activity => {
      console.log(`  ${activity.name}: ${activity.imageUrl ? '✅ Has image' : '❌ No image'}`);
      if (activity.imageUrl) {
        console.log(`    URL: ${activity.imageUrl}`);
      }
    });
    
    console.log('\n📊 Summary:');
    const totalCities = await prisma.city.count();
    const citiesWithImages = await prisma.city.count({ where: { imageUrl: { not: null } } });
    const totalActivities = await prisma.activity.count();
    const activitiesWithImages = await prisma.activity.count({ where: { imageUrl: { not: null } } });
    
    console.log(`  Cities: ${citiesWithImages}/${totalCities} have images`);
    console.log(`  Activities: ${activitiesWithImages}/${totalActivities} have images`);
    
  } catch (error) {
    console.error('❌ Error checking images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkImages();
