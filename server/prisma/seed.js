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
      name: 'Deepak Meena',
      email: 'deepak23188@iiitd.ac.in',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
      preferences: { currency: 'USD', language: 'en', notifications: true },
      passwordHash,
    },
  });

  // cities with unique images - 50 cities
  await prisma.city.createMany({
    data: [
      {
        name: 'New York City', country: 'United States', region: 'North America',
        costIndex: 145, popularity: 98,
        imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1600&h=900&fit=crop&crop=center',
        description: 'Skyscraper-packed cultural capital known for Broadway, museums, and diverse neighborhoods.',
        currency: 'USD', averageDailyCost: 220,
      },
      {
        name: 'London', country: 'United Kingdom', region: 'Europe',
        costIndex: 140, popularity: 99,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1671734045770-4b9e1a5e53a0?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bG9uZG9ufGVufDB8fDB8fHww',
        description: 'Historic yet modern hub with royal landmarks, West End theatres, and riverside walks.',
        currency: 'GBP', averageDailyCost: 180,
      },
      {
        name: 'Paris', country: 'France', region: 'Europe',
        costIndex: 135, popularity: 100,
        imageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGFyaXN8ZW58MHx8MHx8fDA%3D',
        description: 'Romantic boulevards, world-class art, and café culture centered around the Seine.',
        currency: 'EUR', averageDailyCost: 170,
      },
      {
        name: 'Tokyo', country: 'Japan', region: 'Asia',
        costIndex: 125, popularity: 97,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1661914240950-b0124f20a5c1?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dG9reW98ZW58MHx8MHx8fDA%3D',
        description: 'Neon-soaked megacity blending tradition, tech, and unmatched food scenes.',
        currency: 'JPY', averageDailyCost: 16000,
      },
      {
        name: 'Dubai', country: 'United Arab Emirates', region: 'Middle East',
        costIndex: 130, popularity: 95,
        imageUrl: 'https://images.unsplash.com/flagged/photo-1559717865-a99cac1c95d8?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8ZHViYWl8ZW58MHx8MHx8fDA%3D',
        description: 'Futuristic desert metropolis famed for luxury shopping, skyscrapers, and beaches.',
        currency: 'AED', averageDailyCost: 550,
      },
      {
        name: 'Singapore', country: 'Singapore', region: 'Asia',
        costIndex: 130, popularity: 94,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1697730373939-3ebcaa9d295e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c2luZ2Fwb3JlfGVufDB8fDB8fHww',
        description: 'Clean, green city-state with hawker food, gardens, and efficient transit.',
        currency: 'SGD', averageDailyCost: 220,
      },
      {
        name: 'Hong Kong', country: 'China (SAR)', region: 'Asia',
        costIndex: 130, popularity: 92,
        imageUrl: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aG9uZyUyMGtvbmd8ZW58MHx8MHx8fDA%3D',
        description: 'Dramatic skyline, dim sum heaven, and lush hiking trails minutes from the city.',
        currency: 'HKD', averageDailyCost: 900,
      },
      {
        name: 'Bangkok', country: 'Thailand', region: 'Asia',
        costIndex: 75, popularity: 93,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1661963188068-1bac46e28727?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YmFuZ2tva3xlbnwwfHwwfHx8MA%3D%3D',
        description: 'Vibrant street life, ornate temples, and legendary street food.',
        currency: 'THB', averageDailyCost: 2800,
      },
      {
        name: 'Istanbul', country: 'Turkey', region: 'Europe/Asia',
        costIndex: 80, popularity: 90,
        imageUrl: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aXN0YW5idWx8ZW58MHx8MHx8fDA%3D',
        description: 'Where East meets West—Ottoman mosques, bazaars, and Bosphorus views.',
        currency: 'TRY', averageDailyCost: 2200,
      },
      {
        name: 'Rome', country: 'Italy', region: 'Europe',
        costIndex: 115, popularity: 96,
        imageUrl: 'https://images.unsplash.com/photo-1529154036614-a60975f5c760?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cm9tZXxlbnwwfHwwfHx8MA%3D%3D',
        description: 'Ancient ruins and Renaissance art set amid lively piazzas and trattorias.',
        currency: 'EUR', averageDailyCost: 150,
      },
      {
        name: 'Barcelona', country: 'Spain', region: 'Europe',
        costIndex: 110, popularity: 95,
        imageUrl: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmFyY2Vsb25hfGVufDB8fDB8fHww',
        description: 'Gaudí architecture, beaches, and late-night tapas culture.',
        currency: 'EUR', averageDailyCost: 140,
      },
      {
        name: 'Madrid', country: 'Spain', region: 'Europe',
        costIndex: 105, popularity: 90,
        imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFkcmlkfGVufDB8fDB8fHww',
        description: 'Elegant boulevards, golden art triangle, and energetic nightlife.',
        currency: 'EUR', averageDailyCost: 135,
      },
      {
        name: 'Amsterdam', country: 'Netherlands', region: 'Europe',
        costIndex: 120, popularity: 92,
        imageUrl: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YW1zdGVyZGFtfGVufDB8fDB8fHww',
        description: 'Canal-laced city of bikes, art museums, and cozy brown cafés.',
        currency: 'EUR', averageDailyCost: 150,
      },
      {
        name: 'Berlin', country: 'Germany', region: 'Europe',
        costIndex: 100, popularity: 91,
        imageUrl: 'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmVybGlufGVufDB8fDB8fHww',
        description: 'Creative capital with layered history, galleries, and nightlife.',
        currency: 'EUR', averageDailyCost: 140,
      },
      {
        name: 'Vienna', country: 'Austria', region: 'Europe',
        costIndex: 115, popularity: 88,
        imageUrl: 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dmllbm5hfGVufDB8fDB8fHww',
        description: 'Imperial palaces, coffeehouse tradition, and classical music heritage.',
        currency: 'EUR', averageDailyCost: 145,
      },
      {
        name: 'Prague', country: 'Czechia', region: 'Europe',
        costIndex: 85, popularity: 89,
        imageUrl: 'https://images.unsplash.com/photo-1564511287568-54483b52a35e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cHJhZ3VlfGVufDB8fDB8fHww',
        description: 'Storybook old town, gothic spires, and riverside beer gardens.',
        currency: 'CZK', averageDailyCost: 2200,
      },
      {
        name: 'Budapest', country: 'Hungary', region: 'Europe',
        costIndex: 80, popularity: 87,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1680721310107-46b29d3b1d7f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YnVkYXBlc3R8ZW58MHx8MHx8fDA%3D',
        description: 'Thermal baths, grand architecture, and a buzzing Danube scene.',
        currency: 'HUF', averageDailyCost: 26000,
      },
      {
        name: 'Venice', country: 'Italy', region: 'Europe',
        costIndex: 125, popularity: 90,
        imageUrl: 'https://images.unsplash.com/photo-1519112232436-9923c6ba3d26?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dmVuaWNlfGVufDB8fDB8fHww',
        description: 'Floating maze of canals, bridges, and timeless palazzi.',
        currency: 'EUR', averageDailyCost: 160,
      },
      {
        name: 'Milan', country: 'Italy', region: 'Europe',
        costIndex: 120, popularity: 85,
        imageUrl: 'https://images.unsplash.com/photo-1588523641901-a18c795682e6?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8bWlsYW58ZW58MHx8MHx8fDA%3D',
        description: 'Italy\'s fashion and design capital with a striking cathedral.',
        currency: 'EUR', averageDailyCost: 155,
      },
      {
        name: 'Florence', country: 'Italy', region: 'Europe',
        costIndex: 110, popularity: 86,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1676288635850-cd91d5b2a3af?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZmxvcmVuY2V8ZW58MHx8MHx8fDA%3D',
        description: 'Renaissance masterpiece city packed with art, gelato, and views.',
        currency: 'EUR', averageDailyCost: 150,
      },
      {
        name: 'Lisbon', country: 'Portugal', region: 'Europe',
        costIndex: 95, popularity: 88,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1677344289076-b4e8d7325e94?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bGlzYm9ufGVufDB8fDB8fHww',
        description: 'Sunlit hills, tile-clad buildings, and soulful fado music.',
        currency: 'EUR', averageDailyCost: 120,
      },
      {
        name: 'Dublin', country: 'Ireland', region: 'Europe',
        costIndex: 110, popularity: 82,
        imageUrl: 'https://images.unsplash.com/photo-1518005068251-37900150dfca?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZHVibGlufGVufDB8fDB8fHww',
        description: 'Friendly pubs, Georgian streets, and riverside strolls.',
        currency: 'EUR', averageDailyCost: 140,
      },
      {
        name: 'Edinburgh', country: 'United Kingdom', region: 'Europe',
        costIndex: 105, popularity: 80,
        imageUrl: 'https://images.unsplash.com/photo-1569668444050-b7bc2bfec0c7?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZWRpbmJ1cmdofGVufDB8fDB8fHww',
        description: 'Medieval old town crowned by a dramatic castle and festivals.',
        currency: 'GBP', averageDailyCost: 130,
      },
      {
        name: 'Athens', country: 'Greece', region: 'Europe',
        costIndex: 85, popularity: 84,
        imageUrl: 'https://images.unsplash.com/photo-1630933868840-1e9299a5b8dd?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8QXRoZW5zfGVufDB8fDB8fHww',
        description: 'Ancient Acropolis meets lively modern neighborhoods and mezze.',
        currency: 'EUR', averageDailyCost: 110,
      },
      {
        name: 'Santorini', country: 'Greece', region: 'Europe',
        costIndex: 125, popularity: 83,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1661964149725-fbf14eabd38c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8U2FudG9yaW5pfGVufDB8fDB8fHww',
        description: 'Cliffside villages, sunsets, and volcanic beaches in the Aegean.',
        currency: 'EUR', averageDailyCost: 160,
      },
      {
        name: 'Zurich', country: 'Switzerland', region: 'Europe',
        costIndex: 160, popularity: 79,
        imageUrl: 'https://images.unsplash.com/photo-1657137436880-e906b111b040?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8WnVyaWNofGVufDB8fDB8fHww',
        description: 'Pristine lakeside city with finance, design, and alpine access.',
        currency: 'CHF', averageDailyCost: 220,
      },
      {
        name: 'Geneva', country: 'Switzerland', region: 'Europe',
        costIndex: 155, popularity: 74,
        imageUrl: 'https://images.unsplash.com/photo-1584200463394-bba4b2117e4d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8R2VuZXZhfGVufDB8fDB8fHww',
        description: 'Diplomatic hub on Lake Geneva with mountain backdrops.',
        currency: 'CHF', averageDailyCost: 210,
      },
      {
        name: 'Stockholm', country: 'Sweden', region: 'Europe',
        costIndex: 135, popularity: 77,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1697729828023-35f1eb84db3e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8U3RvY2tob2xtfGVufDB8fDB8fHww',
        description: 'Island city of design, nature, and cozy cafés.',
        currency: 'SEK', averageDailyCost: 1500,
      },
      {
        name: 'Copenhagen', country: 'Denmark', region: 'Europe',
        costIndex: 130, popularity: 78,
        imageUrl: 'https://images.unsplash.com/photo-1552560880-2482cef14240?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29wZW5oYWdlbnxlbnwwfHwwfHx8MA%3D%3D',
        description: 'Colorful harbors, cycling culture, and new nordic cuisine.',
        currency: 'DKK', averageDailyCost: 1200,
      },
      {
        name: 'Oslo', country: 'Norway', region: 'Europe',
        costIndex: 140, popularity: 72,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1697729977121-26f13fd5434c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8b3Nsb3xlbnwwfHwwfHx8MA%3D%3D',
        description: 'Waterfront museums, fjord views, and modern architecture.',
        currency: 'NOK', averageDailyCost: 1700,
      },
      {
        name: 'Helsinki', country: 'Finland', region: 'Europe',
        costIndex: 115, popularity: 70,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1742493639933-4eeb46df59af?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8aGVsc2lua2l8ZW58MHx8MHx8fDA%3D',
        description: 'Nordic cool with saunas, design, and seaside parks.',
        currency: 'EUR', averageDailyCost: 130,
      },
      {
        name: 'Reykjavik', country: 'Iceland', region: 'Europe',
        costIndex: 145, popularity: 69,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1661962984700-16b03ecda58a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8UmV5a2phdmlrfGVufDB8fDB8fHww',
        description: 'Compact gateway to geysers, glaciers, and nightlife.',
        currency: 'ISK', averageDailyCost: 20000,
      },
      {
        name: 'Toronto', country: 'Canada', region: 'North America',
        costIndex: 120, popularity: 85,
        imageUrl: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8VG9yb250b3xlbnwwfHwwfHx8MA%3D%3D',
        description: 'Multicultural metropolis with lakefront and top-tier food.',
        currency: 'CAD', averageDailyCost: 170,
      },
      {
        name: 'Vancouver', country: 'Canada', region: 'North America',
        costIndex: 125, popularity: 80,
        imageUrl: 'https://images.unsplash.com/photo-1502228362178-086346ac6862?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8VmFuY291dmVyfGVufDB8fDB8fHww',
        description: 'Sea-to-sky city with mountains, beaches, and sushi.',
        currency: 'CAD', averageDailyCost: 180,
      },
      {
        name: 'Los Angeles', country: 'United States', region: 'North America',
        costIndex: 125, popularity: 90,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1725408106567-a77bd9beff7c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8TG9zJTIwQW5nZWxlc3xlbnwwfHwwfHx8MA%3D%3D',
        description: 'Sprawling sunshine, film studios, beaches, and tacos.',
        currency: 'USD', averageDailyCost: 190,
      },
      {
        name: 'San Francisco', country: 'United States', region: 'North America',
        costIndex: 150, popularity: 86,
        imageUrl: 'https://images.unsplash.com/photo-1610494475096-ad11c3a21638?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fFNhbiUyMEZyYW5jaXNjb3xlbnwwfHwwfHx8MA%3D%3D',
        description: 'Golden Gate vistas, tech culture, and steep streets.',
        currency: 'USD', averageDailyCost: 220,
      },
      {
        name: 'Chicago', country: 'United States', region: 'North America',
        costIndex: 120, popularity: 84,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1669927131902-a64115445f0f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Q2hpY2Fnb3xlbnwwfHwwfHx8MA%3D%3D',
        description: 'Architectural icon with deep-dish pizza and lakefront paths.',
        currency: 'USD', averageDailyCost: 170,
      },
      {
        name: 'Mexico City', country: 'Mexico', region: 'North America',
        costIndex: 70, popularity: 88,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1694475520908-c2f6a1144acf?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8TWV4aWNvJTIwY2l0eXxlbnwwfHwwfHx8MA%3D%3D',
        description: 'Vast capital of markets, museums, and modern cuisine.',
        currency: 'MXN', averageDailyCost: 2000,
      },
      {
        name: 'São Paulo', country: 'Brazil', region: 'South America',
        costIndex: 65, popularity: 77,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1683888229109-17cb0975af20?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8UyVDMyVBM28lMjBQYXVsb3xlbnwwfHwwfHx8MA%3D%3D',
        description: 'Brazil\'s economic engine with endless dining and arts.',
        currency: 'BRL', averageDailyCost: 400,
      },
      {
        name: 'Buenos Aires', country: 'Argentina', region: 'South America',
        costIndex: 60, popularity: 80,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1697729901052-fe8900e24993?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8QnVlbm9zJTIwQWlyZXN8ZW58MHx8MHx8fDA%3D',
        description: 'European-style boulevards, tango, and steak culture.',
        currency: 'ARS', averageDailyCost: 90000,
      },
      {
        name: 'Cape Town', country: 'South Africa', region: 'Africa',
        costIndex: 75, popularity: 82,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1697730061063-ad499e343f26?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Q2FwZSUyMFRvd258ZW58MHx8MHx8fDA%3D',
        description: 'Dramatic Table Mountain, beaches, and vineyards.',
        currency: 'ZAR', averageDailyCost: 1400,
      },
      {
        name: 'Marrakech', country: 'Morocco', region: 'Africa',
        costIndex: 65, popularity: 75,
        imageUrl: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8TWFycmFrZWNofGVufDB8fDB8fHww',
        description: 'Walled medina, souks, riads, and desert excursions.',
        currency: 'MAD', averageDailyCost: 900,
      },
      {
        name: 'Cairo', country: 'Egypt', region: 'Africa',
        costIndex: 55, popularity: 78,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1697729777503-5a6ff8d6d877?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2Fpcm98ZW58MHx8MHx8fDA%3D',
        description: 'Gateway to ancient pyramids along the Nile.',
        currency: 'EGP', averageDailyCost: 1400,
      },
      {
        name: 'Delhi', country: 'India', region: 'Asia',
        costIndex: 55, popularity: 92,
        imageUrl: 'https://images.unsplash.com/photo-1598977054780-2dc700fdc9d3?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8RGVsaGl8ZW58MHx8MHx8fDA%3D',
        description: 'Historic capital mixing Mughal sites and bustling bazaars.',
        currency: 'INR', averageDailyCost: 3500,
      },
      {
        name: 'Mumbai', country: 'India', region: 'Asia',
        costIndex: 65, popularity: 90,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1673240845266-2f2c432cf194?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bXVtYmFpfGVufDB8fDB8fHww',
        description: 'Bollywood\'s home with seafront promenades and street eats.',
        currency: 'INR', averageDailyCost: 4200,
      },
      {
        name: 'Bengaluru', country: 'India', region: 'Asia',
        costIndex: 60, popularity: 82,
        imageUrl: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmVuZ2FsdXJ1fGVufDB8fDB8fHww',
        description: 'Garden city & India\'s tech hub with craft beer and cafes.',
        currency: 'INR', averageDailyCost: 2800,
      },
      {
        name: 'Shanghai', country: 'China', region: 'Asia',
        costIndex: 95, popularity: 89,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1675826460422-e39481fae224?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8c2hhbmdoYWl8ZW58MHx8MHx8fDA%3D',
        description: 'Skyline on the Bund, old lanes, and cutting-edge dining.',
        currency: 'CNY', averageDailyCost: 650,
      },
      {
        name: 'Beijing', country: 'China', region: 'Asia',
        costIndex: 90, popularity: 87,
        imageUrl: 'https://images.unsplash.com/photo-1611416517780-eff3a13b0359?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGJlaWppbmd8ZW58MHx8MHx8fDA%3D',
        description: 'Imperial landmarks, hutongs, and Great Wall access.',
        currency: 'CNY', averageDailyCost: 600,
      },
      {
        name: 'Seoul', country: 'South Korea', region: 'Asia',
        costIndex: 95, popularity: 91,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1661885493074-e18964497278?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fFNlb3VsfGVufDB8fDB8fHww',
        description: 'K-culture capital with palaces, street food, and shopping.',
        currency: 'KRW', averageDailyCost: 120000,
      },
      {
        name: 'Sydney', country: 'Australia', region: 'Oceania',
        costIndex: 120, popularity: 90,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1697730198238-48ee2f2fe1b7?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8U3lkbmV5fGVufDB8fDB8fHww',
        description: 'Harbour city with iconic sails, beaches, and cafés.',
        currency: 'AUD', averageDailyCost: 180,
      },
      {
        name: 'Melbourne', country: 'Australia', region: 'Oceania',
        costIndex: 110, popularity: 86,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1733317293766-5606f74b765b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8TWVsYm91cm5lfGVufDB8fDB8fHww',
        description: 'Coffee capital with laneways, arts, and sport.',
        currency: 'AUD', averageDailyCost: 170,
      },
      {
        name: 'Auckland', country: 'New Zealand', region: 'Oceania',
        costIndex: 105, popularity: 78,
        imageUrl: 'https://images.unsplash.com/photo-1600208669687-f19af3638cb9?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8QXVja2xhbmR8ZW58MHx8MHx8fDA%3D',
        description: 'Harbors, volcanoes, and gateway to North Island adventures.',
        currency: 'NZD', averageDailyCost: 160,
      },
    ],
  });

  // Get cities by name for activities
  const paris = await prisma.city.findFirst({ where: { name: 'Paris' } });
  const tokyo = await prisma.city.findFirst({ where: { name: 'Tokyo' } });
  const london = await prisma.city.findFirst({ where: { name: 'London' } });
  const newYork = await prisma.city.findFirst({ where: { name: 'New York City' } });
  const rome = await prisma.city.findFirst({ where: { name: 'Rome' } });
  const barcelona = await prisma.city.findFirst({ where: { name: 'Barcelona' } });
  const dubai = await prisma.city.findFirst({ where: { name: 'Dubai' } });
  const singapore = await prisma.city.findFirst({ where: { name: 'Singapore' } });
  const mumbai = await prisma.city.findFirst({ where: { name: 'Mumbai' } });
  const sydney = await prisma.city.findFirst({ where: { name: 'Sydney' } });

  // activities - comprehensive list for multiple cities
  await prisma.activity.createMany({
    data: [
      // Paris Activities
      {
        name: 'Eiffel Tower Visit',
        description: 'Iconic iron lattice tower with stunning city views from the top',
        category: 'sightseeing',
        cost: 25, duration: 3, rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1708033950433-f5a879efff59?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8RWlmZmVsJTIwVG93ZXIlMjBWaXNpdHxlbnwwfHwwfHx8MA%3D%3D',
        cityId: paris?.id, isBooked: false,
      },
      {
        name: 'Louvre Museum Tour',
        description: 'World-famous art museum featuring the Mona Lisa and ancient artifacts',
        category: 'culture',
        cost: 17, duration: 4, rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1625641631117-ff3da8055bf8?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fExvdXZyZSUyME11c2V1bSUyMFRvdXJ8ZW58MHx8MHx8fDA%3D',
        cityId: paris?.id, isBooked: false,
      },
      {
        name: 'Seine River Cruise',
        description: 'Romantic boat tour along the Seine with dinner and live music',
        category: 'sightseeing',
        cost: 45, duration: 2, rating: 4.6,
        imageUrl: 'https://images.unsplash.com/photo-1743450589308-30508cc51304?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8U2VpbmUlMjBSaXZlciUyMENydWlzZXxlbnwwfHwwfHx8MA%3D%3D',
        cityId: paris?.id, isBooked: false,
      },
      {
        name: 'French Cooking Class',
        description: 'Learn to make authentic French pastries and classic dishes',
        category: 'food',
        cost: 120, duration: 4, rating: 4.9,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1683707120428-8893fe258de8?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8RnJlbmNoJTIwQ29va2luZyUyMENsYXNzfGVufDB8fDB8fHww',
        cityId: paris?.id, isBooked: false,
      },

      // Tokyo Activities
      {
        name: 'Sushi Making Workshop',
        description: 'Learn to make authentic sushi with a master chef',
        category: 'food',
        cost: 80, duration: 2, rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1512132411229-c30391241dd8?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8U3VzaGklMjBNYWtpbmclMjBXb3Jrc2hvcHxlbnwwfHwwfHx8MA%3D%3D',
        cityId: tokyo?.id, isBooked: false,
      },
      {
        name: 'Shibuya Crossing Experience',
        description: 'Experience the world\'s busiest pedestrian crossing',
        category: 'sightseeing',
        cost: 0, duration: 1, rating: 4.5,
        imageUrl: 'https://images.unsplash.com/photo-1512699587109-3eb606946b8c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8U2hpYnV5YSUyMENyb3NzaW5nJTIwRXhwZXJpZW5jZXxlbnwwfHwwfHx8MA%3D%3D',
        cityId: tokyo?.id, isBooked: false,
      },
      {
        name: 'Traditional Tea Ceremony',
        description: 'Participate in a traditional Japanese tea ceremony',
        category: 'culture',
        cost: 35, duration: 1, rating: 4.7,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1726812156717-989863cefe5d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8VHJhZGl0aW9uYWwlMjBUZWElMjBDZXJlbW9ueXxlbnwwfHwwfHx8MA%3D%3D',
        cityId: tokyo?.id, isBooked: false,
      },
      {
        name: 'Mount Fuji Day Trip',
        description: 'Guided tour to Mount Fuji with hiking and photography',
        category: 'nature',
        cost: 150, duration: 8, rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1586012007759-e302826262e9?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8TW91bnQlMjBGdWppJTIwRGF5JTIwVHJpcHxlbnwwfHwwfHx8MA%3D%3D',
        cityId: tokyo?.id, isBooked: false,
      },

      // London Activities
      {
        name: 'Big Ben & Westminster Tour',
        description: 'Guided tour of iconic London landmarks and Parliament',
        category: 'sightseeing',
        cost: 30, duration: 3, rating: 4.6,
        imageUrl: 'https://images.unsplash.com/photo-1663583513676-9f6361cd859d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8QmlnJTIwQmVuJTIwJTI2JTIwV2VzdG1pbnN0ZXIlMjBUb3VyfGVufDB8fDB8fHww',
        cityId: london?.id, isBooked: false,
      },
      {
        name: 'British Museum Visit',
        description: 'Explore world-famous artifacts and ancient history',
        category: 'culture',
        cost: 0, duration: 4, rating: 4.7,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1694475282880-4d02465afa55?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8QnJpdGlzaCUyME11c2V1bXxlbnwwfHwwfHx8MA%3D%3D',
        cityId: london?.id, isBooked: false,
      },
      {
        name: 'Afternoon Tea at The Ritz',
        description: 'Traditional English afternoon tea in luxury setting',
        category: 'food',
        cost: 85, duration: 2, rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1667143297265-0e3e080e886e?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fEFmdGVybm9vbiUyMFRlYSUyMGF0JTIwVGhlJTIwUml0enxlbnwwfHwwfHx8MA%3D%3D',
        cityId: london?.id, isBooked: false,
      },

      // New York Activities
      {
        name: 'Empire State Building',
        description: 'Visit the iconic skyscraper with panoramic city views',
        category: 'sightseeing',
        cost: 40, duration: 2, rating: 4.6,
        imageUrl: 'https://images.unsplash.com/photo-1428366890462-dd4baecf492b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8RW1waXJlJTIwU3RhdGUlMjBCdWlsZGluZ3xlbnwwfHwwfHx8MA%3D%3D',
        cityId: newYork?.id, isBooked: false,
      },
      {
        name: 'Broadway Show',
        description: 'Experience world-class theater and musical performances',
        category: 'culture',
        cost: 120, duration: 3, rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1560184611-5b5749138c3c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8QnJvYWR3YXklMjBTaG93fGVufDB8fDB8fHww',
        cityId: newYork?.id, isBooked: false,
      },
      {
        name: 'Central Park Walking Tour',
        description: 'Guided tour of Central Park\'s landmarks and hidden gems',
        category: 'nature',
        cost: 25, duration: 2, rating: 4.5,
        imageUrl: 'https://images.unsplash.com/photo-1650839322343-532cd49f1127?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Q2VudHJhbCUyMFBhcmslMjBXYWxraW5nJTIwVG91cnxlbnwwfHwwfHx8MA%3D%3D',
        cityId: newYork?.id, isBooked: false,
      },

      // Rome Activities
      {
        name: 'Colosseum & Roman Forum',
        description: 'Explore ancient Roman ruins and gladiator arena',
        category: 'sightseeing',
        cost: 20, duration: 4, rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1601645234855-761c5648639f?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Q29sb3NzZXVtJTIwJTI2JTIwUm9tYW4lMjBGb3J1bXxlbnwwfHwwfHx8MA%3D%3D',
        cityId: rome?.id, isBooked: false,
      },
      {
        name: 'Vatican Museums & Sistine Chapel',
        description: 'World-famous art collection and Michelangelo\'s masterpiece',
        category: 'culture',
        cost: 25, duration: 5, rating: 4.9,
        imageUrl: 'https://images.unsplash.com/photo-1569758884017-9cac918c1fba?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8VmF0aWNhbiUyME11c2V1bXMlMjAlMjYlMjBTaXN0aW5lJTIwQ2hhcGVsfGVufDB8fDB8fHww',
        cityId: rome?.id, isBooked: false,
      },
      {
        name: 'Italian Cooking Class',
        description: 'Learn to make authentic pasta and pizza from scratch',
        category: 'food',
        cost: 90, duration: 3, rating: 4.7,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1726866038051-24172df56f06?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8SXRhbGlhbiUyMENvb2tpbmclMjBDbGFzc3xlbnwwfHwwfHx8MA%3D%3D',
        cityId: rome?.id, isBooked: false,
      },

      // Barcelona Activities
      {
        name: 'Sagrada Familia Tour',
        description: 'Guided tour of Gaudi\'s masterpiece cathedral',
        category: 'sightseeing',
        cost: 30, duration: 2, rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1581333293462-ee963adf0786?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8U2FncmFkYSUyMEZhbWlsaWElMjBUb3VyfGVufDB8fDB8fHww',
        cityId: barcelona?.id, isBooked: false,
      },
      {
        name: 'Tapas Food Tour',
        description: 'Explore local tapas bars and traditional Spanish cuisine',
        category: 'food',
        cost: 65, duration: 3, rating: 4.6,
        imageUrl: 'https://images.unsplash.com/photo-1569508896713-2ba59a035e08?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8VGFwYXMlMjBGb29kJTIwVG91cnxlbnwwfHwwfHx8MA%3D%3D',
        cityId: barcelona?.id, isBooked: false,
      },
      {
        name: 'Flamenco Show',
        description: 'Traditional Spanish dance performance with dinner',
        category: 'culture',
        cost: 55, duration: 2, rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1564883585098-a673507f49a0?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8RmxhbWVuY28lMjBTaG93fGVufDB8fDB8fHww',
        cityId: barcelona?.id, isBooked: false,
      },

      // Dubai Activities
      {
        name: 'Burj Khalifa Observation Deck',
        description: 'Visit the world\'s tallest building for panoramic views',
        category: 'sightseeing',
        cost: 35, duration: 2, rating: 4.7,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1672056403748-d687a87b16a1?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8QnVyaiUyMEtoYWxpZmElMjBPYnNlcnZhdGlvbiUyMERlY2t8ZW58MHx8MHx8fDA%3D',
        cityId: dubai?.id, isBooked: false,
      },
      {
        name: 'Desert Safari Adventure',
        description: 'Dune bashing, camel riding, and traditional dinner',
        category: 'adventure',
        cost: 120, duration: 6, rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1547399899-14115e6a7773?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8RGVzZXJ0JTIwU2FmYXJpJTIwQWR2ZW50dXJlfGVufDB8fDB8fHww',
        cityId: dubai?.id, isBooked: false,
      },
      {
        name: 'Gold Souk Shopping Tour',
        description: 'Explore traditional markets and gold jewelry',
        category: 'shopping',
        cost: 0, duration: 2, rating: 4.4,
        imageUrl: 'https://images.unsplash.com/photo-1649773965074-26c817bc7636?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8R29sZCUyMFNvdWslMjBTaG9wcGluZyUyMFRvdXJ8ZW58MHx8MHx8fDA%3D',
        cityId: dubai?.id, isBooked: false,
      },

      // Singapore Activities
      {
        name: 'Marina Bay Sands SkyPark',
        description: 'Infinity pool and observation deck with city views',
        category: 'sightseeing',
        cost: 25, duration: 2, rating: 4.6,
        imageUrl: 'https://images.unsplash.com/photo-1725281097332-6511ba49d816?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8TWFyaW5hJTIwQmF5JTIwU2FuZHMlMjBTa3lQYXJrfGVufDB8fDB8fHww',
        cityId: singapore?.id, isBooked: false,
      },
      {
        name: 'Hawker Center Food Tour',
        description: 'Sample local street food and traditional dishes',
        category: 'food',
        cost: 45, duration: 3, rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1649871343389-a37c1756a76b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8SGF3a2VyJTIwQ2VudGVyJTIwRm9vZCUyMFRvdXJ8ZW58MHx8MHx8fDA%3D',
        cityId: singapore?.id, isBooked: false,
      },
      {
        name: 'Gardens by the Bay',
        description: 'Explore futuristic gardens and light show',
        category: 'nature',
        cost: 20, duration: 3, rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1552415274-73ad7198cb93?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8R2FyZGVucyUyMGJ5JTIwdGhlJTIwQmF5fGVufDB8fDB8fHww',
        cityId: singapore?.id, isBooked: false,
      },

      // Mumbai Activities
      {
        name: 'Gateway of India & Marine Drive',
        description: 'Iconic landmarks and scenic coastal drive',
        category: 'sightseeing',
        cost: 0, duration: 2, rating: 4.5,
        imageUrl: 'https://images.unsplash.com/photo-1523959269011-788ec4bd06bc?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8R2F0ZXdheSUyMG9mJTIwSW5kaWElMjAlMjYlMjBNYXJpbmUlMjBEcml2ZXxlbnwwfHwwfHx8MA%3D%3D',
        cityId: mumbai?.id, isBooked: false,
      },
      {
        name: 'Bollywood Studio Tour',
        description: 'Behind-the-scenes tour of India\'s film industry',
        category: 'culture',
        cost: 35, duration: 3, rating: 4.6,
        imageUrl: 'https://images.unsplash.com/photo-1481886756534-97af88ccb438?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Qm9sbHl3b29kJTIwU3R1ZGlvJTIwVG91cnxlbnwwfHwwfHx8MA%3D%3D',
        cityId: mumbai?.id, isBooked: false,
      },
      {
        name: 'Street Food Walking Tour',
        description: 'Explore local street food and chaat specialties',
        category: 'food',
        cost: 25, duration: 3, rating: 4.7,
        imageUrl: 'https://plus.unsplash.com/premium_photo-1679816655240-341f19e8027d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW5kaWFuJTIwc3RyZWV0JTIwZm9vZCUyMHRvdXJ8ZW58MHx8MHx8fDA%3D',
        cityId: mumbai?.id, isBooked: false,
      },

      // Sydney Activities
      {
        name: 'Sydney Opera House Tour',
        description: 'Guided tour of the iconic performing arts center',
        category: 'sightseeing',
        cost: 40, duration: 2, rating: 4.8,
        imageUrl: 'https://images.unsplash.com/photo-1490443849367-d12c30dbf95c?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fFN5ZG5leSUyME9wZXJhJTIwSG91c2UlMjBUb3VyfGVufDB8fDB8fHww',
        cityId: sydney?.id, isBooked: false,
      },
      {
        name: 'Bondi Beach Surfing Lesson',
        description: 'Learn to surf at Australia\'s most famous beach',
        category: 'adventure',
        cost: 75, duration: 3, rating: 4.6,
        imageUrl: 'https://images.unsplash.com/photo-1600970188293-313e1f61beb0?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Qm9uZGklMjBCZWFjaCUyMFN1cmZpbmclMjBMZXNzb258ZW58MHx8MHx8fDA%3D',
        cityId: sydney?.id, isBooked: false,
      },
      {
        name: 'Blue Mountains Day Trip',
        description: 'Scenic hiking and wildlife in World Heritage area',
        category: 'nature',
        cost: 95, duration: 8, rating: 4.7,
        imageUrl: 'https://images.unsplash.com/photo-1599543159100-3cc45ff9b0c0?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Qmx1ZSUyME1vdW50YWlucyUyMERheSUyMFRyaXAlMjBBdXN0cmFsaWF8ZW58MHx8MHx8fDA%3D',
        cityId: sydney?.id, isBooked: false,
      },
    ],
  });

  // No hardcoded trips - users start with a clean slate
  // Removed sample trips - users will create their own trips

  console.log('✅ Database seeded successfully!');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});