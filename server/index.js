const express = require('express');
const cors = require('cors');
const prisma = require('./prismaClient');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const { sendEmail, sendCustomEmail, verifyEmailConfig, emailTemplates } = require('./config/email');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const puppeteer = require('puppeteer');
const session = require('express-session');
const jwt = require('jsonwebtoken');

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

// Add session middleware (after other middleware, before routes)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Only set up Google OAuth if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('Google profile:', profile);
      
      // Check if user already exists
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { googleId: profile.id },
            { email: profile.emails[0].value }
          ]
        }
      });

      if (user) {
        // Update Google ID if not set
        if (!user.googleId) {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { 
              googleId: profile.id,
              avatar: profile.photos[0]?.value || user.avatar
            }
          });
        }
        return done(null, user);
      }

      // Create new user
      user = await prisma.user.create({
        data: {
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          avatar: profile.photos[0]?.value || null,
          preferences: {
            currency: 'USD',
            language: 'en',
            notifications: true
          }
        }
      });

      console.log('Created new user:', user);
      return done(null, user);
    } catch (error) {
      console.error('Google OAuth error:', error);
      return done(error, null);
    }
  }));

  // Google OAuth routes
  app.get('/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      try {
        const user = req.user;
        console.log('Google auth successful for user:', user);
        
        // Generate JWT token
        const token = jwt.sign(
          { 
            userId: user.id, 
            email: user.email,
            name: user.name 
          },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        res.redirect(`${frontendUrl}/auth-callback?token=${token}&success=true`);
      } catch (error) {
        console.error('Error generating token:', error);
        res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=auth_failed`);
      }
    }
  );
}

// Verify JWT token endpoint
app.get('/api/auth/verify-token', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update existing login endpoint to use JWT
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('=== LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('Password provided:', password ? 'Yes' : 'No');

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    console.log('User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('User ID:', user.id);
      console.log('User name:', user.name);
      console.log('Has passwordHash:', user.passwordHash ? 'Yes' : 'No');
      console.log('PasswordHash length:', user.passwordHash ? user.passwordHash.length : 0);
    }

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.passwordHash) {
      console.log('No password hash found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Login successful for user:', user.email);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        name: user.name 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    const responseData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences
      },
      token 
    };

    console.log('Sending response:', responseData);
    res.json(responseData);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
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

// Delete user account
app.delete('/api/auth/delete-account', async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const { password } = req.body;

    // Optional: Verify password before deletion
    if (password) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(400).json({ error: 'Invalid password' });
      }
    }

    // Delete all user data (trips, stops, activities, etc.)
    await prisma.$transaction(async (tx) => {
      // Delete all trips and related data
      await tx.trip.deleteMany({
        where: { userId: userId }
      });

      // Delete user's profile image if exists
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { avatar: true }
      });

      if (user?.avatar && user.avatar.includes('/uploads/')) {
        const imagePath = path.join(__dirname, 'uploads', path.basename(user.avatar));
        try {
          fs.unlinkSync(imagePath);
        } catch (error) {
          console.error('Error deleting profile image:', error);
        }
      }

      // Finally delete the user
      await tx.user.delete({
        where: { id: userId }
      });
    });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
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

// Helper to extract userId consistently
function getUserId(req) {
  return req.user?.userId || req.user?.id || req.header('x-user-id') || req.query.userId || (req.body && req.body.userId);
}

// JWT Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    console.log('JWT token decoded successfully:', { userId: user.userId, email: user.email });
    req.user = user;
    next();
  });
}

function requireUserId(req, res) {
  const uid = getUserId(req);
  if (!uid) {
    console.log('No user ID found in request. req.user:', req.user);
    res.status(400).json({ error: 'User ID is required' });
    return null;
  }
  return uid;
}

// List trips for specific user
app.get('/api/trips', async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

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
    const userId = requireUserId(req, res);
    if (!userId) return;

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
    console.log('Trip creation request:', req.body);
    console.log('Headers:', req.headers);
    
    const {
      name, description, coverPhoto,
      startDate, endDate,
      destinationCity, destinationCountry,
      totalBudget, estimatedCost, userId
    } = req.body;

    // Get user ID from multiple sources
    const finalUserId = userId || req.header('x-user-id') || req.query.userId;
    
    if (!finalUserId) {
      console.log('No user ID found in request');
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('Creating trip for user:', finalUserId);

    // Coerce numbers safely
    const est = Number(estimatedCost);
    const tot = Number(totalBudget);

    const trip = await prisma.trip.create({
      data: {
        name,
        description,
        coverPhoto,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        destinationCity,
        destinationCountry,
        totalBudget: Number.isFinite(tot) ? tot : 0,
        estimatedCost: Number.isFinite(est) ? est : 0,
        userId: finalUserId,
      },
    });
    
    console.log('Trip created successfully:', trip);
    res.status(201).json(trip);
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ error: 'Failed to create trip: ' + error.message });
  }
});

// Update trip endpoint
app.put('/api/trips/:id', async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const tripId = req.params.id;
    const updateData = req.body;

    // Verify trip belongs to user
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: userId }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        name: updateData.name,
        description: updateData.description,
        startDate: new Date(updateData.startDate),
        endDate: new Date(updateData.endDate),
        destinationCity: updateData.destinationCity,
        destinationCountry: updateData.destinationCountry,
        totalBudget: updateData.totalBudget ? parseFloat(updateData.totalBudget) : null,
        estimatedCost: updateData.estimatedCost ? parseFloat(updateData.estimatedCost) : null
      }
    });

    res.json(updatedTrip);

  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ error: 'Failed to update trip' });
  }
});

// Delete a trip
app.delete('/api/trips/:id', async (req, res) => {
  try {
    console.log('Delete trip request:', {
      tripId: req.params.id,
      headers: req.headers,
      query: req.query
    });

    const userId = requireUserId(req, res);
    console.log('User ID from request:', userId);
    
    if (!userId) {
      console.log('No user ID found, returning 400');
      return;
    }

    const tripId = req.params.id;
    console.log('Looking for trip:', tripId, 'for user:', userId);

    // Check if trip belongs to user
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: userId }
    });

    console.log('Found trip:', trip);

    if (!trip) {
      console.log('Trip not found');
      return res.status(404).json({ error: 'Trip not found' });
    }

    await prisma.trip.delete({
      where: { id: tripId }
    });

    console.log('Trip deleted successfully');
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

/** ---- Cities (for "Popular Destinations") ---- */

app.get('/api/cities', async (_req, res) => {
  const cities = await prisma.city.findMany({ orderBy: { popularity: 'desc' } });
  res.json(cities);
});

/** ---- Dashboard aggregate ---- */
app.get('/api/dashboard', async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

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
        take: 8
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
      estimatedCost: 0,
      stopsCount: 0,
    }));

    const popularDestinations = topCities.map((c) => ({
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

// Forgot password endpoint
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Delete any existing reset tokens for this user
    await prisma.passwordReset.deleteMany({
      where: { userId: user.id }
    });

    // Create new reset token
    await prisma.passwordReset.create({
      data: {
        email: user.email,
        token: token,
        expiresAt: expiresAt,
        userId: user.id
      }
    });

    // Generate reset URL
    const resetUrl = `http://localhost:5174/reset-password?token=${token}`;
    
    // Send email
    const emailResult = await sendEmail(user.email, 'passwordReset', {
      resetUrl: resetUrl,
      userName: user.name
    });

    if (emailResult.success) {
      console.log(`✅ Password reset email sent to ${email}`);
      
      // Log the email sending
      appendJsonArray('password_resets.json', {
        timestamp: new Date().toISOString(),
        action: 'forgot_password_request',
        userId: user.id,
        email: user.email,
        success: true,
        messageId: emailResult.messageId
      });

      res.json({ 
        message: 'If an account with that email exists, a reset link has been sent.',
        emailSent: true
      });
    } else {
      console.error('❌ Failed to send email:', emailResult.error);
      
      // Log the email failure
      appendJsonArray('password_resets.json', {
        timestamp: new Date().toISOString(),
        action: 'forgot_password_request',
        userId: user.id,
        email: user.email,
        success: false,
        error: emailResult.error
      });

      // For demo purposes, still return the reset URL in console
      console.log(`Demo mode - Reset URL for ${email}: ${resetUrl}`);
      
      res.json({ 
        message: 'If an account with that email exists, a reset link has been sent.',
        emailSent: false,
        resetUrl: resetUrl // Remove this in production
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
});

// Reset password endpoint
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Find the reset token
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token: token },
      include: { user: true }
    });

    if (!resetRecord) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (resetRecord.used) {
      return res.status(400).json({ error: 'Reset token has already been used' });
    }

    if (resetRecord.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user's password
    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash: passwordHash }
    });

    // Mark reset token as used
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true }
    });

    // Log the password change
    appendJsonArray('password_resets.json', {
      timestamp: new Date().toISOString(),
      action: 'password_reset',
      userId: resetRecord.userId,
      email: resetRecord.email,
      success: true
    });

    res.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Add this route for trip photo upload
app.post('/api/trips/upload-photo', upload.single('image'), async (req, res) => {
  try {
    console.log('Trip image upload request received:', req.body);
    console.log('File:', req.file);
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('Trip image uploaded successfully:', req.file.filename);
    const imageUrl = `http://localhost:4000/uploads/${req.file.filename}`;
    
    res.json({ 
      success: true, 
      imageUrl,
      filename: req.file.filename 
    });
  } catch (error) {
    console.error('Trip image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image: ' + error.message });
  }
});

// Add these budget-related endpoints before app.listen

// Get budget breakdown for a trip
app.get('/api/trips/:tripId/budget', async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const tripId = req.params.tripId;

    // Get trip with budget data
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: userId },
      include: {
        budgetItems: true,
        stops: {
          include: {
            activities: true
          }
        }
      }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Calculate budget breakdown
    const budgetBreakdown = {
      transport: 0,
      accommodation: 0,
      activities: 0,
      meals: 0,
      other: 0
    };

    // Calculate from budget items
    trip.budgetItems.forEach(item => {
      budgetBreakdown[item.category] += item.amount;
    });

    // Calculate from activities
    trip.stops.forEach(stop => {
      stop.activities.forEach(activity => {
        if (activity.cost) {
          budgetBreakdown.activities += activity.cost;
        }
      });
    });

    const totalBudget = trip.totalBudget || 0;
    const totalSpent = Object.values(budgetBreakdown).reduce((sum, amount) => sum + amount, 0);
    const remaining = totalBudget - totalSpent;

    res.json({
      trip,
      budgetBreakdown,
      totalBudget,
      totalSpent,
      remaining,
      averagePerDay: trip.stops.length > 0 ? totalSpent / trip.stops.length : 0
    });

  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({ error: 'Failed to fetch budget data' });
  }
});

// Add budget item
app.post('/api/trips/:tripId/budget-items', async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const tripId = req.params.tripId;
    const { category, description, amount, date } = req.body;

    // Verify trip belongs to user
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: userId }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const budgetItem = await prisma.budgetItem.create({
      data: {
        tripId,
        category,
        description,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date()
      }
    });

    res.json(budgetItem);

  } catch (error) {
    console.error('Error adding budget item:', error);
    res.status(500).json({ error: 'Failed to add budget item' });
  }
});

// Get budget items for a trip
app.get('/api/trips/:tripId/budget-items', async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const tripId = req.params.tripId;

    // Verify trip belongs to user
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: userId }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const budgetItems = await prisma.budgetItem.findMany({
      where: { tripId },
      orderBy: { date: 'desc' }
    });

    res.json(budgetItems);

  } catch (error) {
    console.error('Error fetching budget items:', error);
    res.status(500).json({ error: 'Failed to fetch budget items' });
  }
});

// Update budget item
app.put('/api/budget-items/:id', async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const { id } = req.params;
    const { category, description, amount, date } = req.body;

    // Verify budget item belongs to user's trip
    const budgetItem = await prisma.budgetItem.findFirst({
      where: { id },
      include: {
        trip: {
          where: { userId }
        }
      }
    });

    if (!budgetItem) {
      return res.status(404).json({ error: 'Budget item not found' });
    }

    const updatedItem = await prisma.budgetItem.update({
      where: { id },
      data: {
        category,
        description,
        amount: parseFloat(amount),
        date: date ? new Date(date) : budgetItem.date
      }
    });

    res.json(updatedItem);

  } catch (error) {
    console.error('Error updating budget item:', error);
    res.status(500).json({ error: 'Failed to update budget item' });
  }
});

// Delete budget item
app.delete('/api/budget-items/:id', async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const { id } = req.params;

    // Verify budget item belongs to user's trip
    const budgetItem = await prisma.budgetItem.findFirst({
      where: { id },
      include: {
        trip: {
          where: { userId }
        }
      }
    });

    if (!budgetItem) {
      return res.status(404).json({ error: 'Budget item not found' });
    }

    await prisma.budgetItem.delete({
      where: { id }
    });

    res.json({ message: 'Budget item deleted successfully' });

  } catch (error) {
    console.error('Error deleting budget item:', error);
    res.status(500).json({ error: 'Failed to delete budget item' });
  }
});

// Initialize AI Budget Predictor
const AIBudgetPredictor = require('./services/aiBudgetPredictor');
let aiBudgetPredictor = null;

// Initialize AI model on server start
async function initializeAI() {
  try {
    aiBudgetPredictor = new AIBudgetPredictor();
    await aiBudgetPredictor.initialize();
    console.log('🤖 AI Budget Predictor initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize AI Budget Predictor:', error);
  }
}

// Initialize AI when server starts
initializeAI();

// AI Budget Prediction endpoint
app.post('/api/ai/predict-budget', async (req, res) => {
  try {
    const { trip } = req.body;
    
    if (!aiBudgetPredictor) {
      return res.status(503).json({ error: 'AI model not initialized' });
    }
    
    const prediction = await aiBudgetPredictor.predictBudgetBreakdown(trip);
    res.json(prediction);
  } catch (error) {
    console.error('AI prediction error:', error);
    res.status(500).json({ error: 'Failed to generate AI predictions' });
  }
});

// Get city statistics
app.get('/api/ai/city-stats/:cityName', async (req, res) => {
  try {
    const { cityName } = req.params;
    
    if (!aiBudgetPredictor) {
      return res.status(503).json({ error: 'AI model not initialized' });
    }
    
    const stats = await aiBudgetPredictor.getCityStatistics(cityName);
    if (!stats) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error getting city stats:', error);
    res.status(500).json({ error: 'Failed to get city statistics' });
  }
});

// Compare cities
app.post('/api/ai/compare-cities', async (req, res) => {
  try {
    const { cityNames } = req.body;
    
    if (!aiBudgetPredictor) {
      return res.status(503).json({ error: 'AI model not initialized' });
    }
    
    const comparison = await aiBudgetPredictor.compareCities(cityNames);
    res.json(comparison);
  } catch (error) {
    console.error('Error comparing cities:', error);
    res.status(500).json({ error: 'Failed to compare cities' });
  }
});

// ML Prediction endpoint (legacy)
app.post('/api/ml/predict-budget', async (req, res) => {
  try {
    const { trip, marketData, historicalData } = req.body;
    
    // Simple ML algorithm using linear regression
    const predictions = await runMLAlgorithm(trip, marketData, historicalData);
    
    res.json(predictions);
  } catch (error) {
    console.error('ML prediction error:', error);
    res.status(500).json({ error: 'Failed to generate predictions' });
  }
});

// Simple ML algorithm (legacy)
const runMLAlgorithm = async (trip, marketData, historicalData) => {
  const tripDuration = differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1;
  
  // Calculate seasonal factors
  const month = new Date(trip.startDate).getMonth();
  const seasonalFactor = getSeasonalFactor(month, trip.destinationCity);
  
  // Calculate market volatility
  const marketVolatility = calculateMarketVolatility(marketData);
  
  // Use historical data for trend analysis
  const trendFactor = analyzeTrends(historicalData, trip.destinationCity);
  
  // Generate predictions with confidence scores
  const predictions = [
    {
      category: 'Accommodation',
      predictedAmount: calculateAccommodationCost(trip, marketData, seasonalFactor, marketVolatility, trendFactor),
      confidence: calculateConfidence(marketData, historicalData),
      reasoning: generateReasoning('accommodation', trip, marketData, seasonalFactor),
      recommendations: generateRecommendations('accommodation', trip, marketData),
      marketData: marketData?.hotels
    },
    // Add more categories...
  ];
  
  return predictions;
};

const getSeasonalFactor = (month, city) => {
  // Calculate seasonal pricing factors
  const seasonalFactors = {
    'paris': [0.8, 0.7, 0.9, 1.0, 1.1, 1.2, 1.3, 1.2, 1.1, 1.0, 0.9, 0.8],
    'london': [0.7, 0.6, 0.8, 0.9, 1.0, 1.1, 1.2, 1.1, 1.0, 0.9, 0.8, 0.7],
    // Add more cities...
  };
  
  return seasonalFactors[city.toLowerCase()]?.[month] || 1.0;
};

const calculateMarketVolatility = (marketData) => {
  // Calculate market volatility based on price variations
  if (!marketData?.hotels?.prices) return 1.0;
  
  const prices = marketData.hotels.prices;
  const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
  
  return Math.sqrt(variance) / mean;
};

const analyzeTrends = (historicalData, city) => {
  // Analyze historical spending trends
  if (!historicalData || historicalData.length === 0) return 1.0;
  
  const cityData = historicalData.filter(data => data.city.toLowerCase() === city.toLowerCase());
  if (cityData.length === 0) return 1.0;
  
  // Calculate trend (simple linear regression)
  const recentData = cityData.slice(-6); // Last 6 months
  const trend = recentData.reduce((sum, data, index) => sum + (data.averageCost * (index + 1)), 0) / recentData.length;
  
  return trend > 0 ? 1.1 : 0.9;
};

const calculateConfidence = (marketData, historicalData) => {
  // Calculate confidence based on data quality and quantity
  let confidence = 0.5; // Base confidence
  
  if (marketData?.hotels) confidence += 0.2;
  if (marketData?.transport) confidence += 0.15;
  if (marketData?.activities) confidence += 0.15;
  if (historicalData && historicalData.length > 10) confidence += 0.1;
  
  return Math.min(confidence, 0.95);
};

// Email share endpoint with PDF attachment - JWT AUTHENTICATION REQUIRED
app.post('/api/trips/share-email', authenticateToken, async (req, res) => {
  try {
    const { tripId, recipientEmail, senderName, senderEmail } = req.body;
    
    console.log('Email share request:', { tripId, recipientEmail, senderName, senderEmail });
    
    if (!tripId || !recipientEmail) {
      return res.status(400).json({ error: 'Missing required fields: tripId, recipientEmail' });
    }

    // First, try to get the trip (without public restriction initially)
    let trip = await prisma.trip.findFirst({
      where: { id: tripId }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // If trip is not public, make it public automatically
    if (!trip.isPublic) {
      console.log('Making trip public for email sharing:', tripId);
      trip = await prisma.trip.update({
        where: { id: tripId },
        data: { isPublic: true }
      });
      console.log('Trip made public successfully for sharing');
    }

    // Create sender object with default values if not provided
    const sender = {
      name: senderName || 'Trip Owner',
      email: senderEmail || 'noreply@globetrotter.com'
    };

    // Generate PDF content
    const pdfContent = await generateTripPDF(trip);

    // Generate share URL
    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shared-trip/${trip.id}`;
    
    // Get email template content
    const emailContent = emailTemplates.itineraryShare(trip, sender, shareUrl);
    
    // Send email with PDF attachment using custom email function
    const emailResult = await sendCustomEmail({
      to: recipientEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
      attachments: [{
        filename: `${trip.name.replace(/[^a-zA-Z0-9]/g, '_')}-itinerary.pdf`,
        content: pdfContent,
        contentType: 'application/pdf'
      }]
    });

    // Record the shared trip in database
    const sharedBy = getUserId(req) || trip.userId || 'unknown';
    console.log('Final sharedBy value for share-email:', sharedBy);
    
    // Validate sharedBy before creating database record
    if (!sharedBy || sharedBy === 'unknown') {
      console.error('❌ Invalid sharedBy value in share-email:', sharedBy);
      console.error('req.user:', req.user);
      console.error('getUserId result:', getUserId(req));
      console.error('trip.userId:', trip.userId);
    }
    
    const sharedTripData = {
      tripId: trip.id,
      sharedBy: sharedBy,
      sharedWith: recipientEmail,
      shareMethod: 'email',
      shareUrl: shareUrl,
      isActive: true
    };
    
    console.log('Creating shared trip with data (share-email):', sharedTripData);
    
    try {
      await prisma.sharedTrip.create({
        data: sharedTripData
      });
    } catch (dbError) {
      console.error('Database error in share-email:', dbError);
      console.error('Failed to create shared trip with data:', sharedTripData);
      // Continue with success response since email was sent
    }

    console.log('Email sent successfully:', emailResult);
    res.json({ 
      success: true, 
      message: 'Itinerary shared successfully',
      tripMadePublic: !trip.isPublic // Indicate if trip was made public
    });
  } catch (error) {
    console.error('Error sharing trip via email:', error);
    res.status(500).json({ error: 'Failed to share trip: ' + error.message });
  }
});

// Simple email share endpoint with JWT authentication
app.post('/api/trips/share-email-simple', authenticateToken, async (req, res) => {
  try {
    const { tripId, recipientEmail } = req.body;
    
    console.log('Simple email share request:', { tripId, recipientEmail });
    
    if (!tripId || !recipientEmail) {
      return res.status(400).json({ error: 'Trip ID and recipient email are required' });
    }

    // Find the trip
    const trip = await prisma.trip.findFirst({
      where: { id: tripId }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    console.log('Trip found:', trip.name);

    // Make trip public if it's not already
    if (!trip.isPublic) {
      await prisma.trip.update({
        where: { id: tripId },
        data: { isPublic: true }
      });
      console.log('Trip made public for sharing');
    }

    // Create sender object
    const sender = {
      name: 'GlobeTrotter',
      email: 'deepak23188@iiitd.ac.in'
    };

    // Generate share URL
    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shared-trip/${trip.id}`;
    
    // Get email template content
    const emailContent = emailTemplates.itineraryShare(trip, sender, shareUrl);
    
    console.log('Email content generated, attempting to send...');
    
    // Send email
    const emailResult = await sendCustomEmail({
      to: recipientEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    });

    console.log('Email result:', emailResult);

    if (emailResult.success) {
      console.log(`✅ Trip sharing email sent to ${recipientEmail}`);
      
      // Get user ID from JWT token
      const userId = req.user?.userId;
      console.log('User ID from token:', userId);
      
      try {
        // Record the shared trip in database
        await prisma.sharedTrip.create({
          data: {
            tripId: trip.id,
            sharedBy: userId,
            sharedWith: recipientEmail,
            shareMethod: 'email',
            shareUrl: shareUrl,
            isActive: true
          }
        });
        
        console.log('✅ Database record created successfully');
        
        res.json({ 
          success: true,
          message: 'Itinerary shared successfully!',
          emailSent: true,
          shareUrl: shareUrl
        });
      } catch (dbError) {
        console.error('❌ Database error:', dbError);
        // Email was sent but database record failed - still return success
        res.json({ 
          success: true,
          message: 'Email sent successfully!',
          emailSent: true,
          shareUrl: shareUrl
        });
      }
    } else {
      console.error('❌ Failed to send email:', emailResult.error);
      
      res.json({ 
        success: false,
        message: 'Failed to send email',
        emailSent: false,
        shareUrl: shareUrl,
        error: emailResult.error
      });
    }

  } catch (error) {
    console.error('Simple email share error:', error);
    res.status(500).json({ 
      error: 'Failed to share trip: ' + error.message
    });
  }
});

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const { recipientEmail } = req.body;
    
    if (!recipientEmail) {
      return res.status(400).json({ error: 'Recipient email is required' });
    }

    console.log('Testing email to:', recipientEmail);
    
    const testEmailResult = await sendCustomEmail({
      to: recipientEmail,
      subject: 'Test Email from GlobeTrotter',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email to verify that GlobeTrotter email configuration is working correctly.</p>
        <p>If you receive this email, the email system is working!</p>
        <p>Time sent: ${new Date().toLocaleString()}</p>
      `,
      text: 'Test Email - This is a test email to verify that GlobeTrotter email configuration is working correctly.'
    });

    console.log('Test email result:', testEmailResult);

    if (testEmailResult.success) {
      res.json({ 
        success: true,
        message: 'Test email sent successfully!',
        messageId: testEmailResult.messageId
      });
    } else {
      res.json({ 
        success: false,
        message: 'Test email failed',
        error: testEmailResult.error
      });
    }

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      error: 'Failed to send test email: ' + error.message,
      stack: error.stack
    });
  }
});

// Make trip public for sharing
app.put('/api/trips/:tripId/make-public', async (req, res) => {
  try {
    const userId = requireUserId(req, res);
    if (!userId) return;

    const tripId = req.params.tripId;
    console.log('Making trip public:', { tripId, userId });

    // Verify trip belongs to user
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: userId }
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Make trip public
    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: { isPublic: true }
    });

    console.log('Trip made public successfully:', updatedTrip.id);
    res.json(updatedTrip);
  } catch (error) {
    console.error('Error making trip public:', error);
    res.status(500).json({ error: 'Failed to make trip public' });
  }
});

// Generate share link and track sharing
app.post('/api/trips/:tripId/share-link', authenticateToken, async (req, res) => {
  try {
    console.log('🔗 Share link request received');
    console.log('Request user object:', req.user);
    console.log('Request headers:', req.headers);
    
    const userId = req.user?.userId;
    const tripId = req.params.tripId;
    console.log('Generating share link for trip:', { tripId, userId });

    if (!userId) {
      console.error('❌ No user ID found in request');
      console.error('req.user:', req.user);
      return res.status(401).json({ error: 'User ID is required' });
    }

    // Verify trip belongs to user
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: userId }
    });

    if (!trip) {
      console.error('❌ Trip not found or does not belong to user');
      console.error('Trip ID:', tripId);
      console.error('User ID:', userId);
      return res.status(404).json({ error: 'Trip not found' });
    }

    console.log('✅ Trip found:', trip.name);

    // Make trip public if it's not already
    if (!trip.isPublic) {
      await prisma.trip.update({
        where: { id: tripId },
        data: { isPublic: true }
      });
      console.log('✅ Trip made public for sharing');
    } else {
      console.log('✅ Trip is already public');
    }

    // Generate share URL
    const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shared-trip/${trip.id}`;
    console.log('🔗 Generated share URL:', shareUrl);

    // Record the shared trip in database
    const sharedTripData = {
      tripId: trip.id,
      sharedBy: userId,
      sharedWith: null, // No specific recipient for link sharing
      shareMethod: 'link',
      shareUrl: shareUrl,
      isActive: true
    };
    
    console.log('📝 Creating shared trip record with data:', sharedTripData);
    
    const sharedTrip = await prisma.sharedTrip.create({
      data: sharedTripData
    });

    console.log('✅ Share link generated and tracked:', sharedTrip.id);
    res.json({ 
      success: true,
      shareUrl: shareUrl,
      sharedTripId: sharedTrip.id,
      message: 'Share link generated successfully'
    });
  } catch (error) {
    console.error('❌ Error generating share link:', error);
    res.status(500).json({ error: 'Failed to generate share link: ' + error.message });
  }
});

// Get all shared trips for a user
app.get('/api/shared-trips', authenticateToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    console.log('Fetching shared trips for user:', userId);

    const sharedTrips = await prisma.sharedTrip.findMany({
      where: {
        sharedBy: userId,
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

    console.log(`Found ${sharedTrips.length} shared trips for user`);
    res.json(sharedTrips);
  } catch (error) {
    console.error('Error fetching shared trips:', error);
    res.status(500).json({ error: 'Failed to fetch shared trips' });
  }
});

// Deactivate a shared trip
app.put('/api/shared-trips/:sharedTripId/deactivate', authenticateToken, async (req, res) => {
  try {
    const userId = getUserId(req);
    const sharedTripId = req.params.sharedTripId;
    console.log('Deactivating shared trip:', { sharedTripId, userId });

    // Verify the shared trip belongs to the user
    const sharedTrip = await prisma.sharedTrip.findFirst({
      where: {
        id: sharedTripId,
        sharedBy: userId
      }
    });

    if (!sharedTrip) {
      return res.status(404).json({ error: 'Shared trip not found' });
    }

    // Deactivate the shared trip
    await prisma.sharedTrip.update({
      where: { id: sharedTripId },
      data: { isActive: false }
    });

    console.log('Shared trip deactivated:', sharedTripId);
    res.json({ success: true, message: 'Shared trip deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating shared trip:', error);
    res.status(500).json({ error: 'Failed to deactivate shared trip' });
  }
});

// Public shared trip endpoint
app.get('/api/trips/shared/:tripId', async (req, res) => {
  try {
    const tripId = req.params.tripId;
    console.log('Fetching shared trip:', tripId);
    
    // Get trip with public access (without stops relation)
    const trip = await prisma.trip.findFirst({
      where: { 
        id: tripId,
        isPublic: true // Only return publicly shared trips
      }
    });

    if (!trip) {
      console.log('Trip not found or not public:', tripId);
      return res.status(404).json({ error: 'Trip not found or not publicly shared' });
    }

    console.log('Shared trip found:', trip.name);
    res.json(trip);
  } catch (error) {
    console.error('Error fetching shared trip:', error);
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
});

// Helper function to generate PDF content (updated for current schema)
async function generateTripPDF(trip) {
  const format = (date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${trip.name} - Itinerary</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 40px;
            color: #333;
            line-height: 1.6;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .trip-image {
            max-width: 400px;
            max-height: 250px;
            width: 100%;
            height: auto;
            object-fit: cover;
            border-radius: 12px;
            margin: 20px auto;
            display: block;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border: 2px solid #e5e7eb;
          }
          .trip-info {
            margin-bottom: 30px;
          }
          .trip-info table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .trip-info th, .trip-info td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          .trip-info th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #374151;
            width: 30%;
          }
          .trip-info td {
            color: #1f2937;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="color: #1f2937; margin-bottom: 10px;">${trip.name}</h1>
          <h2 style="color: #3b82f6; margin-bottom: 20px;">Trip Itinerary</h2>
          ${trip.coverPhoto ? `<img src="${trip.coverPhoto}" alt="${trip.name}" class="trip-image">` : ''}
          <p style="color: #6b7280; margin-top: 15px;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="trip-info">
          <h3 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">Trip Details</h3>
          <table>
            <tr>
              <th>Trip Name</th>
              <td>${trip.name}</td>
            </tr>
            <tr>
              <th>Starting Place</th>
              <td>${trip.destinationCity}</td>
            </tr>
            <tr>
              <th>Ending Place</th>
              <td>${trip.destinationCountry}</td>
            </tr>
            <tr>
              <th>Start Date</th>
              <td>${format(trip.startDate)}</td>
            </tr>
            <tr>
              <th>End Date</th>
              <td>${format(trip.endDate)}</td>
            </tr>
            <tr>
              <th>Total Budget</th>
              <td>$${trip.totalBudget?.toFixed(2) || '0.00'}</td>
            </tr>
            <tr>
              <th>Estimated Cost</th>
              <td>$${trip.estimatedCost?.toFixed(2) || '0.00'}</td>
            </tr>
            ${trip.description ? `
              <tr>
                <th>Description</th>
                <td>${trip.description}</td>
              </tr>
            ` : ''}
          </table>
        </div>

        <div class="footer">
          <p>Generated by GlobeTrotter - Plan. Explore. Experience.</p>
          <p>${trip.name} • ${format(trip.startDate)} - ${format(trip.endDate)}</p>
        </div>
      </body>
    </html>
  `;

  try {
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    await browser.close();
    return pdfBuffer;
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback to HTML content if PDF generation fails
    return htmlContent;
  }
}

// Activities API endpoints
app.get('/api/activities', async (req, res) => {
  try {
    const { city, category, costMax, duration, rating } = req.query;
    
    let whereClause = {};
    
    if (city) {
      whereClause.city = {
        name: { contains: city, mode: 'insensitive' }
      };
    }
    
    if (category && category !== 'all') {
      whereClause.category = category;
    }
    
    if (costMax) {
      whereClause.cost = { lte: parseFloat(costMax) };
    }
    
    if (duration) {
      whereClause.duration = { lte: parseInt(duration) };
    }
    
    if (rating) {
      whereClause.rating = { gte: parseFloat(rating) };
    }
    
    const activities = await prisma.activity.findMany({
      where: whereClause,
      include: {
        city: {
          select: {
            id: true,
            name: true,
            country: true,
            region: true,
            imageUrl: true
          }
        }
      },
      orderBy: { rating: 'desc' }
    });
    
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

app.get('/api/activities/search', async (req, res) => {
  try {
    const { city, category, costMax, duration, rating, sortBy = 'rating' } = req.query;
    
    let whereClause = {};
    
    if (city) {
      whereClause.city = {
        name: { contains: city, mode: 'insensitive' }
      };
    }
    
    if (category && category !== 'all') {
      whereClause.category = category;
    }
    
    if (costMax) {
      whereClause.cost = { lte: parseFloat(costMax) };
    }
    
    if (duration) {
      whereClause.duration = { lte: parseInt(duration) };
    }
    
    if (rating) {
      whereClause.rating = { gte: parseFloat(rating) };
    }
    
    let orderBy = {};
    switch (sortBy) {
      case 'rating':
        orderBy.rating = 'desc';
        break;
      case 'cost-low':
        orderBy.cost = 'asc';
        break;
      case 'cost-high':
        orderBy.cost = 'desc';
        break;
      case 'duration':
        orderBy.duration = 'asc';
        break;
      case 'name':
        orderBy.name = 'asc';
        break;
      default:
        orderBy.rating = 'desc';
    }
    
    const activities = await prisma.activity.findMany({
      where: whereClause,
      include: {
        city: {
          select: {
            id: true,
            name: true,
            country: true,
            region: true,
            imageUrl: true
          }
        }
      },
      orderBy
    });
    
    res.json(activities);
  } catch (error) {
    console.error('Error searching activities:', error);
    res.status(500).json({ error: 'Failed to search activities' });
  }
});

app.get('/api/activities/categories', async (req, res) => {
  try {
    const categories = await prisma.activity.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      }
    });
    
    const categoryList = categories.map(cat => ({
      name: cat.category,
      count: cat._count.category
    }));
    
    res.json(categoryList);
  } catch (error) {
    console.error('Error fetching activity categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/activities/:id/book', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const activity = await prisma.activity.update({
      where: { id: parseInt(id) },
      data: { isBooked: true }
    });
    
    res.json({ success: true, activity });
  } catch (error) {
    console.error('Error booking activity:', error);
    res.status(500).json({ error: 'Failed to book activity' });
  }
});

app.post('/api/activities/:id/unbook', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const activity = await prisma.activity.update({
      where: { id: parseInt(id) },
      data: { isBooked: false }
    });
    
    res.json({ success: true, activity });
  } catch (error) {
    console.error('Error unbooking activity:', error);
    res.status(500).json({ error: 'Failed to unbook activity' });
  }
});

// Add city to trip endpoint
app.post('/api/trips/:tripId/add-city', async (req, res) => {
  try {
    const { tripId } = req.params;
    const { cityId, cityName, country, arrivalDate, departureDate } = req.body;
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify the trip belongs to the user
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: userId }
    });
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // For now, we'll update the trip's destination to the new city
    // In a more complex implementation, you might want to create a separate TripStop model
    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        destinationCity: cityName,
        destinationCountry: country,
        updatedAt: new Date()
      }
    });
    
    res.json({ success: true, trip: updatedTrip });
  } catch (error) {
    console.error('Error adding city to trip:', error);
    res.status(500).json({ error: 'Failed to add city to trip' });
  }
});

// Calendar Event Management Endpoints
app.post('/api/calendar/events', async (req, res) => {
  try {
    const { tripId, stopId, name, description, date, duration, cost, category } = req.body;
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify the trip belongs to the user
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: userId }
    });
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Create a new activity in the database
    const newActivity = await prisma.activity.create({
      data: {
        name,
        description,
        category,
        cost: cost || 0,
        duration: duration || 2,
        rating: 0,
        imageUrl: '',
        cityId: 1, // Default city ID - in a real app, you'd get this from the stop
        isBooked: false
      }
    });
    
    // Log the created activity for debugging
    console.log('Created calendar event:', {
      tripId,
      stopId: stopId || 'no-stop-selected',
      activityName: name,
      activityId: newActivity.id
    });
    
    res.json({ success: true, activity: newActivity });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
});

app.put('/api/calendar/events/:activityId', async (req, res) => {
  try {
    const { activityId } = req.params;
    const { name, description, duration, cost, category } = req.body;
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Update the activity
    const updatedActivity = await prisma.activity.update({
      where: { id: parseInt(activityId) },
      data: {
        name,
        description,
        category,
        cost: cost || 0,
        duration: duration || 2
      }
    });
    
    res.json({ success: true, activity: updatedActivity });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    res.status(500).json({ error: 'Failed to update calendar event' });
  }
});

app.delete('/api/calendar/events/:activityId', async (req, res) => {
  try {
    const { activityId } = req.params;
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Delete the activity
    await prisma.activity.delete({
      where: { id: parseInt(activityId) }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    res.status(500).json({ error: 'Failed to delete calendar event' });
  }
});

app.get('/api/calendar/events/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = getUserId(req);
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify the trip belongs to the user
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: userId }
    });
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    // Get all activities for the trip (this is a simplified version)
    // In a real app, you'd have a proper relationship between trips and activities
    const activities = await prisma.activity.findMany({
      take: 50 // Limit for now
    });
    
    res.json({ success: true, activities });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));

// Add this endpoint temporarily for debugging
app.get('/api/debug/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        hasPasswordHash: {
          select: {
            passwordHash: true
          }
        }
      }
    });
    
    const safeUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      hasPassword: !!user.hasPasswordHash?.passwordHash
    }));
    
    res.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Add this temporary endpoint to create a test user
app.post('/api/debug/create-test-user', async (req, res) => {
  try {
    const testPassword = 'test123';
    const passwordHash = await bcrypt.hash(testPassword, 10);
    
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        passwordHash: passwordHash,
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
        preferences: { currency: 'USD', language: 'en', notifications: true },
      },
    });
    
    res.json({ 
      success: true, 
      user: { id: user.id, name: user.name, email: user.email },
      testCredentials: { email: 'test@example.com', password: 'test123' }
    });
  } catch (error) {
    console.error('Error creating test user:', error);
    res.status(500).json({ error: 'Failed to create test user' });
  }
});

// Test JWT token endpoint
app.get('/api/test-jwt', authenticateToken, async (req, res) => {
  try {
    console.log('Test JWT endpoint - req.user:', req.user);
    console.log('User ID from token:', req.user?.userId);
    console.log('User ID from getUserId:', getUserId(req));
    
    res.json({ 
      success: true,
      user: req.user,
      userId: req.user?.userId,
      extractedUserId: getUserId(req)
    });
  } catch (error) {
    console.error('Test JWT error:', error);
    res.status(500).json({ error: 'Test JWT failed' });
  }
});


