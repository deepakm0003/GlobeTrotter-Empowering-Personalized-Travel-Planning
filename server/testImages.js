const { PrismaClient } = require('@prisma/client');
const fetch = require('node-fetch');

const prisma = new PrismaClient();

async function testImageUrl(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function testImages() {
  try {
    console.log('🔍 Testing image URLs accessibility...\n');
    
    // Test a few city images
    const cities = await prisma.city.findMany({ take: 3 });
    console.log('🏙️  Testing city images:');
    
    for (const city of cities) {
      if (city.imageUrl) {
        const isAccessible = await testImageUrl(city.imageUrl);
        console.log(`  ${city.name}: ${isAccessible ? '✅ Accessible' : '❌ Not accessible'}`);
        if (!isAccessible) {
          console.log(`    URL: ${city.imageUrl}`);
        }
      }
    }
    
    // Test a few activity images
    const activities = await prisma.activity.findMany({ take: 3 });
    console.log('\n🎯 Testing activity images:');
    
    for (const activity of activities) {
      if (activity.imageUrl) {
        const isAccessible = await testImageUrl(activity.imageUrl);
        console.log(`  ${activity.name}: ${isAccessible ? '✅ Accessible' : '❌ Not accessible'}`);
        if (!isAccessible) {
          console.log(`    URL: ${activity.imageUrl}`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error testing images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testImages();
