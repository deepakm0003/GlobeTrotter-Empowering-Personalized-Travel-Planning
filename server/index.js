const express = require('express');
const cors = require('cors');
const prisma = require('./prismaClient');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

/** ---- Trips CRUD (minimal) ---- */

// List trips (optionally filter by status via dates if you want later)
app.get('/api/trips', async (req, res) => {
  const trips = await prisma.trip.findMany({ orderBy: { updatedAt: 'desc' } });
  res.json(trips);
});

// Create a trip
app.post('/api/trips', async (req, res) => {
  const {
    name, description, coverPhoto,
    startDate, endDate,
    destinationCity, destinationCountry,
    totalBudget, estimatedCost
  } = req.body;

  const trip = await prisma.trip.create({
    data: {
      name,
      description,
      coverPhoto,
      startDate: new Date(startDate),
      endDate:   new Date(endDate),
      destinationCity,
      destinationCountry,
      totalBudget: totalBudget ?? null,
      estimatedCost: estimatedCost ?? null,
    },
  });
  res.status(201).json(trip);
});

/** ---- Cities (for “Popular Destinations”) ---- */

app.get('/api/cities', async (_req, res) => {
  const cities = await prisma.city.findMany({ orderBy: { popularity: 'desc' } });
  res.json(cities);
});

/** ---- Dashboard aggregate ---- */
app.get('/api/dashboard', async (_req, res) => {
  const now = new Date();

  const [totalTrips, countriesDistinct, upcomingTrips, recentTripsRaw, topCities] = await Promise.all([
    prisma.trip.count(),
    prisma.trip.findMany({ select: { destinationCountry: true }, distinct: ['destinationCountry'] }),
    prisma.trip.count({ where: { startDate: { gt: now } } }),
    prisma.trip.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true, name: true, coverPhoto: true, startDate: true, endDate: true,
      }
    }),
    prisma.city.findMany({
      orderBy: { popularity: 'desc' },
      take: 4
    }),
  ]);

  // Next trip label:
  const nextTrip = await prisma.trip.findFirst({
    where: { startDate: { gt: now } },
    orderBy: { startDate: 'asc' },
    select: { startDate: true },
  });

  // Total spent = sum of estimatedCost (or 0)
  const tripsForSpend = await prisma.trip.findMany({
    select: { estimatedCost: true }
  });
  const totalSpent = Math.round(
    tripsForSpend.reduce((sum, t) => sum + (t.estimatedCost || 0), 0)
  );

  const stats = {
    totalTrips,
    countriesVisited: countriesDistinct.length,
    upcomingTrips,
    totalSpent,
    nextTripLabel: nextTrip
      ? nextTrip.startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
      : undefined,
  };

  const recentTrips = recentTripsRaw.map(t => ({
    id: t.id,
    name: t.name,
    coverPhoto: t.coverPhoto || '',
    startDate: t.startDate.toISOString(),
    endDate: t.endDate.toISOString(),
    estimatedCost: 0,     // if you later add a budgets table, compute real sum
    stopsCount: 0,        // if you add stops table, compute count
  }));

  const popularDestinations = topCities.map((c, i) => ({
    id: c.id,
    name: c.name,
    country: c.country,
    imageUrl: c.imageUrl || '',
    averageDailyCost: c.averageDailyCost ?? 0,
    popularity: Math.max(0, Math.min(100, c.popularity ?? 0)),
  }));

  res.json({ stats, recentTrips, popularDestinations });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
