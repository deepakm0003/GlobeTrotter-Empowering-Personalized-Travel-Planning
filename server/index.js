const express = require('express');
const cors = require('cors');
const prisma = require('./prismaClient');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const { sendEmail, verifyEmailConfig } = require('./config/email');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
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

// Add these imports at the top
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

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

// Google OAuth Strategy
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

// Verify JWT token endpoint
app.get('/api/auth/verify-token', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

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

    res.json({ 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences
      },
      token 
    });
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
  return req.header('x-user-id') || req.query.userId || (req.body && req.body.userId);
}

function requireUserId(req, res) {
  const uid = getUserId(req);
  if (!uid) {
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
    const {
      name, description, coverPhoto,
      startDate, endDate,
      destinationCity, destinationCountry,
      totalBudget, estimatedCost,
    } = req.body;

    const userId = requireUserId(req, res);
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    // Coerce numbers safely
    const est = Number(estimatedCost);
    const tot = Number(totalBudget);

    const trip = await prisma.trip.create({
      data: {
        name,
        description,
        coverPhoto,
        startDate: new Date(startDate),
        endDate:   new Date(endDate),
        destinationCity,
        destinationCountry,
        totalBudget: Number.isFinite(tot) ? tot : 0,
        estimatedCost: Number.isFinite(est) ? est : 0,
        userId,
      },
    });
    res.status(201).json(trip);
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ error: 'Failed to create trip' });
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

/** ---- Cities (for “Popular Destinations”) ---- */

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
app.post('/api/trips/upload-photo', upload.single('tripPhoto'), async (req, res) => {
  try {
    console.log('Upload request received:', req.file); // Debug log
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Create the photo URL
    const photoUrl = `http://localhost:4000/uploads/${req.file.filename}`;
    
    console.log('File uploaded successfully:', {
      filename: req.file.filename,
      photoUrl: photoUrl
    });
    
    res.json({ 
      success: true, 
      photoUrl: photoUrl,
      filename: req.file.filename 
    });
  } catch (error) {
    console.error('Error uploading trip photo:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
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

// ML Prediction endpoint
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

// Simple ML algorithm
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

app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
