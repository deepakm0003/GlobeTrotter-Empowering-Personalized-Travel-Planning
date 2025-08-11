import React, { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, DollarSign, Share2, Edit, Trash2, Eye, Filter, SortAsc } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { format, differenceInDays } from 'date-fns';
import { Trip } from '../../types';
import { fetchMyTrips, deleteTrip } from '../../data/mockData';
import toast from 'react-hot-toast';

const TripsList: React.FC = () => {
  const navigate = useNavigate();
  const { user, trips, setTrips, isLoading, setIsLoading } = useApp();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  // Load trips when component mounts
  useEffect(() => {
    const loadTrips = async () => {
      if (user?.id) {
        try {
          setIsLoading(true);
          const userTrips = await fetchMyTrips(user.id);
          setTrips(userTrips);
        } catch (error) {
          console.error('Failed to load trips:', error);
          setTrips([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadTrips();
  }, [user?.id, setTrips, setIsLoading]);

  // Filter and sort trips
  const filteredAndSortedTrips = React.useMemo(() => {
    let filtered = [...trips];

    // Apply filters
    const now = new Date();
    switch (filter) {
      case 'upcoming':
        filtered = filtered.filter(trip => new Date(trip.startDate) > now);
        break;
      case 'past':
        filtered = filtered.filter(trip => new Date(trip.endDate) < now);
        break;
      case 'ongoing':
        filtered = filtered.filter(trip => 
          new Date(trip.startDate) <= now && new Date(trip.endDate) >= now
        );
        break;
      case 'public':
        filtered = filtered.filter(trip => trip.isPublic);
        break;
      default:
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'cost':
        filtered.sort((a, b) => (b.estimatedCost || 0) - (a.estimatedCost || 0));
        break;
      case 'date':
      default:
        filtered.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        break;
    }

    return filtered;
  }, [trips, filter, sortBy]);

  const TripCard: React.FC<{ trip: Trip }> = ({ trip }) => {
    const duration = differenceInDays(new Date(trip.endDate), new Date(trip.startDate));
    
    const handleDelete = async () => {
      if (window.confirm('Are you sure you want to delete this trip? This action cannot be undone.')) {
        try {
          console.log('Attempting to delete trip:', trip.id, 'for user:', user?.id);
          
          if (!user?.id) {
            toast.error('User not authenticated. Please log in again.');
            return;
          }

          // Test the API call first
          const response = await fetch(`/api/trips/${trip.id}?userId=${user.id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': user.id
            }
          });

          console.log('Delete response:', response.status, response.statusText);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Delete failed:', errorText);
            throw new Error(`Delete failed: ${response.status} ${errorText}`);
          }

          toast.success('Trip deleted successfully');
          
          // Refresh trips list
          const updatedTrips = await fetchMyTrips(user.id);
          setTrips(updatedTrips);
        } catch (error) {
          console.error('Failed to delete trip:', error);
          console.error('Error details:', {
            tripId: trip.id,
            userId: user?.id,
            error: error instanceof Error ? error.message : error
          });
          toast.error('Failed to delete trip. Please try again.');
        }
      }
    };

    const handleEdit = () => {
      // TODO: Implement edit trip functionality
      toast.info('Edit functionality coming soon!');
      console.log('Edit trip:', trip.id);
    };

    const handleShare = () => {
      // TODO: Implement share functionality
      toast.info('Share functionality coming soon!');
      console.log('Share trip:', trip.id);
    };

    const handleViewDetails = () => {
      navigate(`/itinerary/${trip.id}`);
    };

    const handleManageItinerary = () => {
      navigate(`/itinerary-builder/${trip.id}`);
    };

    return (
      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-200">
        {/* Trip Image */}
        <div className="h-48 relative overflow-hidden">
          {trip.coverPhoto ? (
            <img
              src={trip.coverPhoto}
              alt={trip.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to default image if photo fails to load
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center">
              <MapPin className="h-8 w-8 text-white" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute top-4 right-4 flex space-x-2">
            {trip.isPublic && (
              <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium border border-green-500/30">
                Public
              </span>
            )}
            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium border border-blue-500/30">
              {trip.stops?.length || 0} stops
            </span>
          </div>
        </div>

        {/* Trip Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">{trip.name}</h3>
              <p className="text-slate-400 text-sm line-clamp-2">{trip.description || 'No description available'}</p>
            </div>
          </div>

          {/* Trip Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <Calendar className="h-5 w-5 text-blue-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Duration</p>
              <p className="text-sm font-medium text-white">{duration} days</p>
            </div>
            <div className="text-center">
              <MapPin className="h-5 w-5 text-purple-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Destination</p>
              <p className="text-sm font-medium text-white">{trip.destinationCity}</p>
            </div>
            <div className="text-center">
              <DollarSign className="h-5 w-5 text-green-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Budget</p>
              <p className="text-sm font-medium text-white">${trip.estimatedCost || 0}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-slate-700/30 rounded-lg p-3 mb-4">
            <p className="text-sm text-slate-300">
              {format(new Date(trip.startDate), 'MMM d, yyyy')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              title="Share Trip"
            >
              <Share2 className="h-4 w-4 text-slate-400" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
              title="Delete Trip"
            >
              <Trash2 className="h-4 w-4 text-red-400" />
            </button>
            <button
              onClick={() => navigate(`/budget/${trip.id}`)}
              className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              title="View Budget"
            >
              <DollarSign className="h-4 w-4 text-slate-400" />
            </button>
            <button
              onClick={handleManageItinerary}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <MapPin className="h-4 w-4" />
              <span>Manage Itinerary</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">My Trips</h1>
            <p className="text-slate-400 mt-1">Manage and explore your travel adventures</p>
          </div>
          <button
            onClick={() => navigate('/trips/create')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create New Trip</span>
          </button>
        </div>
        <div className="text-center py-16">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Trips</h1>
          <p className="text-slate-400 mt-1">Manage and explore your travel adventures</p>
        </div>
        <button
          onClick={() => navigate('/trips/create')}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create New Trip</span>
        </button>
      </div>

      {/* Filter & Sort */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-8 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="all">All Trips</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="past">Past</option>
              <option value="public">Public</option>
            </select>
          </div>
          <div className="relative">
            <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-8 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="cost">Sort by Cost</option>
            </select>
          </div>
        </div>
        <p className="text-slate-400 text-sm">{filteredAndSortedTrips.length} trips</p>
      </div>

      {/* Trips Grid */}
      {filteredAndSortedTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="h-24 w-24 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-12 w-12 text-slate-500" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No trips yet</h3>
          <p className="text-slate-400 mb-6">Start planning your first adventure!</p>
          <button
            onClick={() => navigate('/trips/create')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
          >
            Create Your First Trip
          </button>
        </div>
      )}
    </div>
  );
};

export default TripsList;