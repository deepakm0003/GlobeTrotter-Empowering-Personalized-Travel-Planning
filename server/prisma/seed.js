const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // user
  const bcrypt = require('bcryptjs');
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'sarah@example.com' },
    update: { passwordHash },
    create: {
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      preferences: { currency: 'USD', language: 'en', notifications: true },
      passwordHash,
    },
  });

  // cities
  await prisma.city.createMany({
    data: [
      {
        name: 'Paris', country: 'France', region: 'Europe',
        costIndex: 85, popularity: 95,
        imageUrl: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'The City of Light, known for its art, fashion, and romance.',
        currency: 'EUR', averageDailyCost: 120,
      },
      {
        name: 'Tokyo', country: 'Japan', region: 'Asia',
        costIndex: 75, popularity: 90,
        imageUrl: 'https://images.pexels.com/photos/2187605/pexels-photo-2187605.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'A vibrant metropolis blending tradition and modernity.',
        currency: 'JPY', averageDailyCost: 100,
      },
      {
        name: 'New York', country: 'United States', region: 'North America',
        costIndex: 90, popularity: 85,
        imageUrl: 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'The Big Apple, a city that never sleeps.',
        currency: 'USD', averageDailyCost: 150,
      },
      {
        name: 'Bali', country: 'Indonesia', region: 'Asia',
        costIndex: 40, popularity: 80,
        imageUrl: 'https://images.pexels.com/photos/2169434/pexels-photo-2169434.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Tropical paradise with beautiful beaches and culture.',
        currency: 'IDR', averageDailyCost: 50,
      },
      {
        name: 'London', country: 'United Kingdom', region: 'Europe',
        costIndex: 88, popularity: 92,
        imageUrl: 'https://images.pexels.com/photos/460672/pexels-photo-460672.jpeg?auto=compress&cs=tinysrgb&w=400',
        description: 'Historic capital with rich culture and royal heritage.',
        currency: 'GBP', averageDailyCost: 130,
      },
    ],
  });

  // get city ids (since City.id is autoincrement int)
  const [paris, tokyo] = await prisma.city.findMany({
    where: { name: { in: ['Paris', 'Tokyo'] } },
    orderBy: { id: 'asc' },
    take: 2,
  });

  // activities
  await prisma.activity.createMany({
    data: [
      {
        name: 'Eiffel Tower Visit',
        description: 'Iconic iron lattice tower with stunning city views',
        category: 'sightseeing',
        cost: 25, duration: 3, rating: 4.8,
        imageUrl: 'https://images.pexels.com/photos/699466/pexels-photo-699466.jpeg?auto=compress&cs=tinysrgb&w=300',
        cityId: paris?.id || 1, isBooked: false,
      },
      {
        name: 'Louvre Museum',
        description: 'World-famous art museum featuring the Mona Lisa',
        category: 'culture',
        cost: 17, duration: 4, rating: 4.7,
        imageUrl: 'https://images.pexels.com/photos/2225442/pexels-photo-2225442.jpeg?auto=compress&cs=tinysrgb&w=300',
        cityId: paris?.id || 1, isBooked: false,
      },
      {
        name: 'Tokyo Sushi Making Class',
        description: 'Learn to make authentic sushi with local chef',
        category: 'food',
        cost: 80, duration: 2, rating: 4.9,
        imageUrl: 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=300',
        cityId: tokyo?.id || 2, isBooked: false,
      },
    ],
  });

  // No hardcoded trips - users start with a clean slate
  console.log('✅ Seed complete - No hardcoded trips created');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
