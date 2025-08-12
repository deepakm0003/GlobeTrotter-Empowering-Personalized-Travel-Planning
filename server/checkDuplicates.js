const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDuplicates() {
  console.log('🔍 Checking for duplicates in database...\n');

  try {
    // Check for duplicate cities
    console.log('📊 Checking cities...');
    const cities = await prisma.city.findMany({
      orderBy: { name: 'asc' }
    });

    console.log(`Total cities: ${cities.length}`);
    
    // Check for duplicate names
    const cityNames = cities.map(c => c.name);
    const uniqueNames = [...new Set(cityNames)];
    const duplicateNames = cityNames.filter((name, index) => cityNames.indexOf(name) !== index);
    
    if (duplicateNames.length > 0) {
      console.log('❌ Duplicate city names found:');
      duplicateNames.forEach(name => {
        const duplicates = cities.filter(c => c.name === name);
        console.log(`  - "${name}" appears ${duplicates.length} times (IDs: ${duplicates.map(c => c.id).join(', ')})`);
      });
    } else {
      console.log('✅ No duplicate city names found');
    }

    // Check for duplicate activities
    console.log('\n🎯 Checking activities...');
    const activities = await prisma.activity.findMany({
      include: {
        city: {
          select: {
            name: true,
            country: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log(`Total activities: ${activities.length}`);
    
    // Check for duplicate activity names
    const activityNames = activities.map(a => a.name);
    const uniqueActivityNames = [...new Set(activityNames)];
    const duplicateActivityNames = activityNames.filter((name, index) => activityNames.indexOf(name) !== index);
    
    if (duplicateActivityNames.length > 0) {
      console.log('❌ Duplicate activity names found:');
      duplicateActivityNames.forEach(name => {
        const duplicates = activities.filter(a => a.name === name);
        console.log(`  - "${name}" appears ${duplicates.length} times (IDs: ${duplicates.map(a => a.id).join(', ')})`);
        duplicates.forEach(dup => {
          console.log(`    * ID ${dup.id}: ${dup.city.name}, ${dup.city.country}`);
        });
      });
    } else {
      console.log('✅ No duplicate activity names found');
    }

    // Check for activities with invalid city references
    console.log('\n🔗 Checking activity-city relationships...');
    const invalidActivities = activities.filter(a => !a.city);
    if (invalidActivities.length > 0) {
      console.log('❌ Activities with invalid city references:');
      invalidActivities.forEach(activity => {
        console.log(`  - Activity "${activity.name}" (ID: ${activity.id}) has invalid cityId: ${activity.cityId}`);
      });
    } else {
      console.log('✅ All activities have valid city references');
    }

    // Show sample of popular destinations that would be returned
    console.log('\n🏙️ Sample popular destinations (top 8 by popularity):');
    const popularCities = await prisma.city.findMany({
      orderBy: { popularity: 'desc' },
      take: 8
    });

    popularCities.forEach((city, index) => {
      console.log(`  ${index + 1}. ${city.name}, ${city.country} (Popularity: ${city.popularity}%)`);
    });

  } catch (error) {
    console.error('❌ Error checking duplicates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDuplicates();
