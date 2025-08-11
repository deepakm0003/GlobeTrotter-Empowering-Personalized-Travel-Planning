import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout/Layout';
import LoginForm from './components/Auth/LoginForm';
import SignupForm from './components/Auth/SignupForm';
import Dashboard from './components/Dashboard/Dashboard';
import TripsList from './components/Trips/TripsList';
import CreateTrip from './components/Trips/CreateTrip';
import ItineraryBuilder from './components/Itinerary/ItineraryBuilder';
import ItineraryView from './components/Itinerary/ItineraryView';
import CitySearch from './components/Search/CitySearch';
import ActivitySearch from './components/Search/ActivitySearch';
import TripCalendar from './components/Calendar/TripCalendar';
import SharedItinerary from './components/Shared/SharedItinerary';
import UserProfile from './components/Profile/UserProfile';
import AdminDashboard from './components/Admin/AdminDashboard';
import BudgetBreakdown from './components/Budget/BudgetBreakdown';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/signup" element={<SignupForm />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trips" element={<TripsList />} />
            <Route path="/trips/create" element={<CreateTrip />} />
            <Route path="/itinerary-builder/:tripId" element={<ItineraryBuilder />} />
            <Route path="/itinerary/:tripId" element={<ItineraryView />} />
            <Route path="/city-search" element={<CitySearch />} />
            <Route path="/activity-search" element={<ActivitySearch />} />
            <Route path="/calendar" element={<TripCalendar />} />
            <Route path="/shared/:tripId" element={<SharedItinerary />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/budget" element={<BudgetBreakdown />} />
            <Route path="/activities" element={<ActivitySearch />} />
            <Route path="/shared" element={<div className="text-white">Shared Trips - Coming Soon</div>} />
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