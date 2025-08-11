import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, DollarSign, Copy, Share2, Heart, Download, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';

const SharedItinerary: React.FC = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { trips } = useApp();
  
  const trip = trips.find(t => t.id === tripId);

  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Trip not found</h2>
          <p className="text-slate-400 mb-6">This trip may be private or no longer available.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalDuration = differenceInDays(new Date(trip.endDate), new Date(trip.startDate));
  const totalCost = trip.stops.reduce((sum, stop) => 
    sum + stop.accommodationCost + stop.transportCost + 
    stop.activities.reduce((actSum, act) => actSum + act.cost, 0), 0
  );

  const copyTrip = () => {
    toast.success('Trip copied to your account!');
    navigate('/trips');
  };

  const shareTrip = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast.success('Trip link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{trip.name}</h1>
                  <p className="text-slate-400">Shared by Sarah Johnson</p>
                </div>
              </div>
              <p className="text-slate-300 mb-4">{trip.description}</p>
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center text-slate-300">
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d, yyyy')}
                </div>
                <div className="flex items-center text-slate-300">
                  <MapPin className="h-4 w-4 mr-2" />
                  {trip.stops.length} destinations
                </div>
                <div className="flex items-center text-slate-300">
                  <Clock className="h-4 w-4 mr-2" />
                  {totalDuration} days
                </div>
                <div className="flex items-center text-green-400">
                  <DollarSign className="h-4 w-4 mr-2" />
                  ${totalCost}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-3 bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-all duration-200">
                <Heart className="h-5 w-5" />
              </button>
              <button
                onClick={shareTrip}
                className="p-3 bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-all duration-200"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button className="p-3 bg-slate-800/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-all duration-200">
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={copyTrip}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
              >
                <Copy className="h-5 w-5" />
                <span>Copy Trip</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Itinerary */}
          {trip.stops.map((stop, index) => {
            const stopDuration = differenceInDays(new Date(stop.departureDate), new Date(stop.arrivalDate));
            const stopCost = stop.accommodationCost + stop.transportCost + 
              stop.activities.reduce((sum, act) => sum + act.cost, 0);

            return (
              <div key={stop.id} className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl overflow-hidden">
                {/* Stop Header */}
                <div className="relative">
                  <img
                    src={stop.city.imageUrl}
                    alt={stop.city.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-bold">
                            {index + 1}
                          </div>
                          <h3 className="text-3xl font-bold text-white">
                            {stop.city.name}, {stop.city.country}
                          </h3>
                        </div>
                        <p className="text-slate-200 text-lg">{stop.city.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium text-lg">{stopDuration} days</p>
                        <p className="text-green-400 text-lg">${stopCost}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stop Details */}
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-2">ARRIVAL</h4>
                      <p className="text-white text-lg">{format(new Date(stop.arrivalDate), 'EEEE, MMMM d, yyyy')}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-2">DEPARTURE</h4>
                      <p className="text-white text-lg">{format(new Date(stop.departureDate), 'EEEE, MMMM d, yyyy')}</p>
                    </div>
                  </div>

                  {/* Activities */}
                  {stop.activities.length > 0 && (
                    <div>
                      <h4 className="text-xl font-semibold text-white mb-6">Activities & Experiences</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stop.activities.map((activity) => (
                          <div key={activity.id} className="bg-slate-700/30 rounded-lg p-6">
                            <div className="flex items-start justify-between mb-3">
                              <h5 className="font-medium text-white text-lg">{activity.name}</h5>
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full capitalize">
                                {activity.category}
                              </span>
                            </div>
                            <p className="text-sm text-slate-400 mb-4">{activity.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="flex items-center text-slate-300">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {activity.duration}h
                                </span>
                                <span className="flex items-center text-green-400">
                                  <DollarSign className="h-4 w-4 mr-1" />
                                  ${activity.cost}
                                </span>
                              </div>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`h-2 w-2 rounded-full mr-1 ${
                                      i < Math.floor(activity.rating) ? 'bg-yellow-400' : 'bg-slate-600'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Trip Summary */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-8">Trip Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="h-16 w-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <p className="text-3xl font-bold text-white">{totalDuration}</p>
                <p className="text-slate-400">Days</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <p className="text-3xl font-bold text-white">{trip.stops.length}</p>
                <p className="text-slate-400">Destinations</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <p className="text-3xl font-bold text-white">
                  {trip.stops.reduce((sum, stop) => sum + stop.activities.length, 0)}
                </p>
                <p className="text-slate-400">Activities</p>
              </div>
              <div className="text-center">
                <div className="h-16 w-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
                <p className="text-3xl font-bold text-white">${totalCost}</p>
                <p className="text-slate-400">Total Cost</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Love this itinerary?</h3>
            <p className="text-slate-300 mb-6">Copy this trip to your account and customize it for your own adventure!</p>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={copyTrip}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
              >
                <Copy className="h-5 w-5" />
                <span>Copy This Trip</span>
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-slate-700 text-white px-8 py-3 rounded-lg font-medium hover:bg-slate-600 transition-all duration-200"
              >
                Sign Up Free
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedItinerary;