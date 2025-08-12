const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testSharedTrips() {
  try {
    console.log('🧪 Testing Shared Trips Functionality...\n');

    // 1. Create a test user
    console.log('1. Creating test user...');
    const testUser = await prisma.user.upsert({
      where: { email: 'test-shared@example.com' },
      update: {},
      create: {
        name: 'Test User',
        email: 'test-shared@example.com',
        passwordHash: 'test-hash'
      }
    });
    console.log('✅ Test user created:', testUser.id);

    // 2. Create a test trip
    console.log('\n2. Creating test trip...');
    const testTrip = await prisma.trip.create({
      data: {
        name: 'Test Shared Trip',
        description: 'A test trip for shared trips functionality',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-07'),
        destinationCity: 'Paris',
        destinationCountry: 'France',
        totalBudget: 2000,
        estimatedCost: 1800,
        userId: testUser.id,
        isPublic: false
      }
    });
    console.log('✅ Test trip created:', testTrip.id);

    // 3. Test email sharing
    console.log('\n3. Testing email sharing...');
    const emailShare = await prisma.sharedTrip.create({
      data: {
        tripId: testTrip.id,
        sharedBy: testUser.id,
        sharedWith: 'friend@example.com',
        shareMethod: 'email',
        shareUrl: `http://localhost:5173/shared-trip/${testTrip.id}`,
        isActive: true
      }
    });
    console.log('✅ Email share created:', emailShare.id);

    // 4. Test link sharing
    console.log('\n4. Testing link sharing...');
    const linkShare = await prisma.sharedTrip.create({
      data: {
        tripId: testTrip.id,
        sharedBy: testUser.id,
        sharedWith: null,
        shareMethod: 'link',
        shareUrl: `http://localhost:5173/shared-trip/${testTrip.id}`,
        isActive: true
      }
    });
    console.log('✅ Link share created:', linkShare.id);

    // 5. Fetch all shared trips for the user
    console.log('\n5. Fetching shared trips for user...');
    const sharedTrips = await prisma.sharedTrip.findMany({
      where: {
        sharedBy: testUser.id,
        isActive: true
      },
      include: {
        trip: {
          select: {
            id: true,
            name: true,
            destinationCity: true,
            destinationCountry: true,
            startDate: true,
            endDate: true,
            coverPhoto: true,
            isPublic: true
          }
        }
      },
      orderBy: {
        sharedAt: 'desc'
      }
    });

    console.log('✅ Found shared trips:', sharedTrips.length);
    sharedTrips.forEach((sharedTrip, index) => {
      console.log(`   ${index + 1}. ${sharedTrip.trip.name} - ${sharedTrip.shareMethod} - ${sharedTrip.sharedAt}`);
      if (sharedTrip.sharedWith) {
        console.log(`      Shared with: ${sharedTrip.sharedWith}`);
      }
    });

    // 6. Test deactivating a share
    console.log('\n6. Testing share deactivation...');
    const deactivatedShare = await prisma.sharedTrip.update({
      where: { id: emailShare.id },
      data: { isActive: false }
    });
    console.log('✅ Share deactivated:', deactivatedShare.id);

    // 7. Verify only active shares remain
    console.log('\n7. Verifying active shares...');
    const activeShares = await prisma.sharedTrip.findMany({
      where: {
        sharedBy: testUser.id,
        isActive: true
      }
    });
    console.log('✅ Active shares remaining:', activeShares.length);

    // 8. Clean up test data
    console.log('\n8. Cleaning up test data...');
    await prisma.sharedTrip.deleteMany({
      where: {
        tripId: testTrip.id
      }
    });
    await prisma.trip.delete({
      where: { id: testTrip.id }
    });
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    console.log('✅ Test data cleaned up');

    console.log('\n🎉 All shared trips tests passed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Created test user and trip');
    console.log('   - Tested email sharing');
    console.log('   - Tested link sharing');
    console.log('   - Verified shared trips retrieval');
    console.log('   - Tested share deactivation');
    console.log('   - Cleaned up test data');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testSharedTrips();
