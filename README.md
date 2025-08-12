# 🌍 GlobeTrotter - Empowering Personalized Travel Planning

A modern, AI-powered travel planning platform that helps users create personalized itineraries, manage budgets, and share trips with friends and family.

![GlobeTrotter](https://img.shields.io/badge/GlobeTrotter-Travel%20Planning-blue?style=for-the-badge&logo=travel)
![React](https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?style=for-the-badge&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js)
![Prisma](https://img.shields.io/badge/Prisma-ORM-purple?style=for-the-badge&logo=prisma)

## ✨ Features

### 🎯 Core Features
- **AI-Powered Trip Planning** - Intelligent itinerary suggestions based on preferences
- **Interactive Itinerary Builder** - Drag-and-drop interface for creating detailed travel plans
- **Budget Management** - Track expenses and get AI-powered budget predictions
- **Real-time Collaboration** - Share trips with friends and family
- **Calendar Integration** - Visual calendar view of your travel schedule
- **Activity Search** - Discover and book activities in your destination

### 🔐 Authentication & Security
- **JWT Authentication** - Secure token-based authentication
- **Google OAuth Integration** - Sign in with Google account
- **Password Reset** - Secure password recovery system
- **Protected Routes** - Role-based access control

### 📱 User Experience
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Dark Mode UI** - Modern, eye-friendly interface
- **Real-time Notifications** - Toast notifications for user feedback
- **Loading States** - Smooth loading animations and states

### 🎨 Advanced Features
- **AI Chatbot** - Interactive travel assistant
- **Weather Integration** - Real-time weather updates for destinations
- **Email Sharing** - Share itineraries via email
- **PDF Export** - Download and print travel plans
- **Admin Dashboard** - User management and analytics

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- SQLite (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/GlobeTrotter-Empowering-Personalized-Travel-Planning.git
   cd GlobeTrotter-Empowering-Personalized-Travel-Planning
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

4. **Set up the database**
   ```bash
   cd server
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Start the development servers**

   **Terminal 1 - Backend:**
   ```bash
   cd server
   npm start
   ```

   **Terminal 2 - Frontend:**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000

## 🏗️ Project Structure

```
GlobeTrotter-Empowering-Personalized-Travel-Planning/
├── src/                          # Frontend source code
│   ├── components/               # React components
│   │   ├── AI/                  # AI chatbot and trip planner
│   │   ├── Auth/                # Authentication components
│   │   ├── Dashboard/           # Dashboard and analytics
│   │   ├── Itinerary/           # Trip planning components
│   │   ├── Layout/              # Navigation and layout
│   │   ├── Profile/             # User profile management
│   │   ├── Search/              # City and activity search
│   │   ├── Shared/              # Trip sharing features
│   │   └── Trips/               # Trip management
│   ├── context/                 # React context providers
│   ├── data/                    # Mock data and API helpers
│   ├── types/                   # TypeScript type definitions
│   └── main.tsx                 # Application entry point
├── server/                      # Backend server
│   ├── config/                  # Configuration files
│   ├── prisma/                  # Database schema and migrations
│   ├── services/                # AI services and business logic
│   ├── uploads/                 # File uploads
│   └── index.js                 # Server entry point
├── public/                      # Static assets
└── package.json                 # Frontend dependencies
```

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **React Hot Toast** - Toast notifications
- **Date-fns** - Date manipulation library

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Prisma** - Modern database ORM
- **SQLite** - Lightweight database (development)
- **JWT** - JSON Web Token authentication
- **Passport.js** - Authentication middleware
- **Multer** - File upload handling
- **Nodemailer** - Email functionality
- **Puppeteer** - PDF generation

### AI & External Services
- **OpenAI API** - AI-powered trip planning and chatbot
- **Google OAuth** - Social authentication
- **Weather API** - Real-time weather data
- **Unsplash API** - High-quality travel images

## 📊 Database Schema

The application uses Prisma ORM with the following main models:

- **User** - User accounts and profiles
- **Trip** - Travel itineraries and plans
- **TripStop** - Individual destinations in a trip
- **Activity** - Activities and experiences
- **City** - Destination information
- **SharedTrip** - Trip sharing functionality

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `server` directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET="your-secret-key"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# Session
SESSION_SECRET="your-session-secret"
```

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
```bash
npm run build
```

### Backend Deployment
1. Set up a production database (PostgreSQL recommended)
2. Configure environment variables
3. Deploy to your preferred hosting service (Heroku, Railway, etc.)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for AI-powered features
- **Google** for OAuth integration
- **Unsplash** for beautiful travel images
- **Lucide** for the icon library
- **Tailwind CSS** for the styling framework

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/yourusername/GlobeTrotter-Empowering-Personalized-Travel-Planning/issues) page
2. Create a new issue with a detailed description
3. Contact the development team

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Advanced AI recommendations
- [ ] Social features and trip sharing
- [ ] Integration with booking platforms
- [ ] Multi-language support
- [ ] Offline mode
- [ ] Advanced analytics and insights

---

**Made with ❤️ by the GlobeTrotter Team**

*Empowering travelers to create unforgettable journeys*
