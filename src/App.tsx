import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout/Layout';
import LoginForm from './components/Auth/LoginForm';
import SignupForm from './components/Auth/SignupForm';
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Dashboard from './components/Dashboard/Dashboard';
import TripsList from './components/Trips/TripsList';
import CreateTrip from './components/Trips/CreateTrip';
import ItineraryBuilder from './components/Itinerary/ItineraryBuilder';
import ItineraryView from './components/Itinerary/ItineraryView';
import CitySearch from './components/Search/CitySearch';
import ActivitySearch from './components/Search/ActivitySearch';
import TripCalendar from './components/Calendar/TripCalendar';
import SharedItinerary from './components/Shared/SharedItinerary';
import SharedTripsPage from './components/Shared/SharedTripsPage';
import ShareTripPage from './components/Shared/ShareTripPage';
import UserProfile from './components/Profile/UserProfile';
import AdminDashboard from './components/Admin/AdminDashboard';
import BudgetBreakdown from './components/Budget/BudgetBreakdown';
import AuthCallback from './components/Auth/AuthCallback';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth-callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/trips" element={<ProtectedRoute><TripsList /></ProtectedRoute>} />
            <Route path="/trips/create" element={<ProtectedRoute><CreateTrip /></ProtectedRoute>} />
            <Route path="/trips/:tripId/share" element={<ProtectedRoute><ShareTripPage /></ProtectedRoute>} />
            <Route path="/itinerary-builder/:tripId" element={<ProtectedRoute><ItineraryBuilder /></ProtectedRoute>} />
            <Route path="/itinerary/:tripId" element={<ProtectedRoute><ItineraryView /></ProtectedRoute>} />
            <Route path="/city-search" element={<ProtectedRoute><CitySearch /></ProtectedRoute>} />
            <Route path="/activity-search" element={<ProtectedRoute><ActivitySearch /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><TripCalendar /></ProtectedRoute>} />
            <Route path="/shared-trip/:tripId" element={<SharedItinerary />} />
            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/budget" element={<ProtectedRoute><BudgetBreakdown /></ProtectedRoute>} />
            <Route path="/trips/:tripId/budget" element={<ProtectedRoute><BudgetBreakdown /></ProtectedRoute>} />
            <Route path="/activities" element={<ProtectedRoute><ActivitySearch /></ProtectedRoute>} />
            <Route path="/shared" element={<ProtectedRoute><SharedTripsPage /></ProtectedRoute>} />
          </Routes>
        </Layout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #334155',
            },
          }}
        />
      </Router>
    </AppProvider>
  );
}

export default App;