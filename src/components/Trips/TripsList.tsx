import React from 'react';
import { Plus, Calendar, MapPin, DollarSign, Share2, Edit, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { format, differenceInDays } from 'date-fns';
import { Trip } from '../../types';

const TripsList: React.FC = () => {
  const navigate = useNavigate();
  const { trips } = useApp();

  const TripCard: React.FC<{ trip: Trip }> = ({ trip }) => {
    const duration = differenceInDays(new Date(trip.endDate), new Date(trip.startDate));
    
    return (
      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all duration-200">
        {/* Trip Image */}
        <div className="h-48 relative overflow-hidden">
          <img
            src={trip.coverPhoto}
            alt={trip.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute top-4 right-4 flex space-x-2">
            {trip.isPublic && (
              <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium border border-green-500/30">
                Public
              </span>
            )}
            <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium border border-blue-500/30">
              {trip.stops.length} stops
            </span>
          </div>
        </div>

        {/* Trip Content */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-2">{trip.name}</h3>
              <p className="text-slate-400 text-sm line-clamp-2">{trip.description}</p>
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
              <p className="text-xs text-slate-400">Cities</p>
              <p className="text-sm font-medium text-white">{trip.stops.length}</p>
            </div>
            <div className="text-center">
              <DollarSign className="h-5 w-5 text-green-400 mx-auto mb-1" />
              <p className="text-xs text-slate-400">Budget</p>
              <p className="text-sm font-medium text-white">${trip.estimatedCost}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-slate-700/30 rounded-lg p-3 mb-4">
            <p className="text-sm text-slate-300">
              {format(new Date(trip.startDate), 'MMM d, yyyy')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              <button className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all duration-200">
                <Eye className="h-4 w-4" />
              </button>
              <button className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition-all duration-200">
                <Edit className="h-4 w-4" />
              </button>
              <button className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-all duration-200">
                <Share2 className="h-4 w-4" />
              </button>
              <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <button 
              onClick={() => navigate(`/itinerary/${trip.id}`)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200"
            >
              View Itinerary
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Trips</h1>
          <p className="text-slate-400 mt-1">Manage and explore your travel adventures</p>
        </div>
        <button
          onClick={() => navigate('/create-trip')}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create New Trip</span>
        </button>
      </div>

      {/* Filter & Sort */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-4">
          <select className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All Trips</option>
            <option>Upcoming</option>
            <option>Past</option>
            <option>Public</option>
          </select>
          <select className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Sort by Date</option>
            <option>Sort by Name</option>
            <option>Sort by Cost</option>
          </select>
        </div>
        <p className="text-slate-400 text-sm">{trips.length} trips</p>
      </div>

      {/* Trips Grid */}
      {trips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
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
            onClick={() => navigate('/create-trip')}
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