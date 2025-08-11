const express = require('express');
const cors = require('cors');
const prisma = require('./prismaClient');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 4000;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors());
app.use(express.json());

// Error handling middleware for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('Multer error:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: 'File upload error: ' + error.message });
  }
  if (error) {
    console.error('Upload error:', error);
    return res.status(400).json({ error: error.message });
  }
  next();
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

/** ---- Simple JSON audit helpers ---- */
function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}
function appendJsonArray(filePath, entry) {
  try {
    ensureDirSync(path.dirname(filePath));
    let arr = [];
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf8');
      if (raw.trim()) arr = JSON.parse(raw);
    }
    arr.push(entry);
    fs.writeFileSync(filePath, JSON.stringify(arr, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to append JSON audit log', e);
  }
}

/** ---- Auth ---- */
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        avatar: `https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2`,
        preferences: { currency: 'USD', language: 'en', notifications: true },
      },
    });

    // Audit log
    appendJsonArray(path.join(__dirname, 'data', 'users.json'), {
      timestamp: new Date().toISOString(),
      action: 'signup',
      userId: user.id,
      email: user.email,
      name: user.name
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Profile image upload endpoint
app.post('/api/auth/upload-profile-image', upload.single('profileImage'), async (req, res) => {
  try {
    console.log('Upload request received:', req.body);
    console.log('File:', req.file);
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('File uploaded successfully:', req.file.filename);
    const imageUrl = `http://localhost:4000/uploads/${req.file.filename}`;
    
    res.json({ 
      success: true, 
      imageUrl,
      filename: req.file.filename 
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image: ' + error.message });
  }
});

// Update user profile with image
app.put('/api/auth/update-profile', async (req, res) => {
  try {
    const { userId, name, email, avatar, preferences } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (avatar) updateData.avatar = avatar;
    if (preferences) updateData.preferences = preferences;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    const { passwordHash, ...userWithoutPassword } = updatedUser;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password endpoint
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Delete account endpoint
app.delete('/api/auth/delete-account', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Delete user's trips first (due to foreign key constraints)
    await prisma.trip.deleteMany({
      where: { userId: userId },
    });

    // Delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const safeUser = { id: user.id, name: user.name, email: user.email, avatar: user.avatar ?? undefined, preferences: user.preferences ?? undefined };

    appendJsonArray(path.join(__dirname, 'data', 'logins.json'), { email: user.email, at: new Date().toISOString() });

    res.json({ user: safeUser });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Optional minimal "me" using header x-user-email for demo
app.get('/api/auth/me', async (req, res) => {
  try {
    const email = req.header('x-user-email') || req.query.email;
    if (!email) return res.status(400).json({ error: 'email header or query required' });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Not found' });
    const safeUser = { id: user.id, name: user.name, email: user.email, avatar: user.avatar ?? undefined, preferences: user.preferences ?? undefined };
    res.json(safeUser);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/** ---- Trips CRUD (minimal) ---- */

// List trips for specific user
app.get('/api/trips', async (req, res) => {
  try {
    const userId = req.query.userId || req.header('x-user-id');
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const trips = await prisma.trip.findMany({ 
      where: { userId: userId },
      orderBy: { updatedAt: 'desc' } 
    });
    res.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// Get user's trips
app.get('/api/trips/my', async (req, res) => {
  try {
    const userId = req.query.userId || req.header('x-user-id');
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const trips = await prisma.trip.findMany({ 
      where: { userId: userId },
      orderBy: { updatedAt: 'desc' } 
    });
    res.json(trips);
  } catch (error) {
    console.error('Error fetching user trips:', error);
    res.status(500).json({ error: 'Failed to fetch user trips' });
  }
});

// Create a trip
app.post('/api/trips', async (req, res) => {
  try {
    const {
      name, description, coverPhoto,
      startDate, endDate,
      destinationCity, destinationCountry,
      totalBudget, estimatedCost,
      userId
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

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
        userId: userId,
      },
    });
    res.status(201).json(trip);
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ error: 'Failed to create trip' });
  }
});

/** ---- Cities (for “Popular Destinations”) ---- */

app.get('/api/cities', async (_req, res) => {
  const cities = await prisma.city.findMany({ orderBy: { popularity: 'desc' } });
  res.json(cities);
});

/** ---- Dashboard aggregate ---- */
app.get('/api/dashboard', async (req, res) => {
  try {
    const userId = req.query.userId || req.header('x-user-id');
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const now = new Date();

    const [totalTrips, countriesDistinct, upcomingTrips, recentTripsRaw, topCities] = await Promise.all([
      prisma.trip.count({ where: { userId: userId } }),
      prisma.trip.findMany({ 
        where: { userId: userId },
        select: { destinationCountry: true }, 
        distinct: ['destinationCountry'] 
      }),
      prisma.trip.count({ where: { userId: userId, startDate: { gt: now } } }),
      prisma.trip.findMany({
        where: { userId: userId },
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
      where: { userId: userId, startDate: { gt: now } },
      orderBy: { startDate: 'asc' },
      select: { startDate: true },
    });

    // Total spent = sum of estimatedCost (or 0)
    const tripsForSpend = await prisma.trip.findMany({
      where: { userId: userId },
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
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
