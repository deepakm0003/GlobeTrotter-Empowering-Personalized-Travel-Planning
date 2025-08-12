import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, DollarSign, Share2, Edit, Download, Eye, EyeOff, Mail } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';

const ItineraryView: React.FC = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { trips } = useApp();
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  
  const trip = trips.find(t => t.id === tripId);

  if (!trip) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-medium text-white mb-4">Trip not found</h2>
        <button
          onClick={() => navigate('/trips')}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg"
        >
          Back to Trips
        </button>
      </div>
    );
  }

  const totalDuration = differenceInDays(new Date(trip.endDate), new Date(trip.startDate));
  const totalCost = trip.stops.reduce((sum, stop) => 
    sum + stop.accommodationCost + stop.transportCost + 
    stop.activities.reduce((actSum, act) => actSum + act.cost, 0), 0
  );

  const shareTrip = async () => {
    try {
      const response = await fetch(`/api/trips/${trip.id}/share-link`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        await navigator.clipboard.writeText(result.shareUrl);
        toast.success('Share link generated and copied to clipboard!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to generate share link');
      }
    } catch (error) {
      console.error('Error generating share link:', error);
      toast.error('Failed to generate share link. Please try again.');
    }
  };

  const togglePublic = () => {
    toast.success(trip.isPublic ? 'Trip made private' : 'Trip made public');
  };

  const handleEmailShare = async () => {
    const recipientEmail = prompt('Enter email address to share with:');
    if (!recipientEmail) return;

    try {
      const response = await fetch('/api/trips/share-email-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tripId: trip.id,
          recipientEmail: recipientEmail
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.emailSent) {
          toast.success('Itinerary shared successfully via email!');
        } else {
          toast.success('Trip made public! Share URL: ' + result.shareUrl);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to share itinerary');
      }
    } catch (error) {
      console.error('Error sharing trip:', error);
      toast.error('Failed to share itinerary. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-500/20 rounded-2xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{trip.name}</h1>
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
            <button
              onClick={togglePublic}
              className={`p-3 rounded-lg transition-all duration-200 ${
                trip.isPublic 
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {trip.isPublic ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </button>
            <button
              onClick={shareTrip}
              className="p-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-all duration-200"
              title="Copy share link"
            >
              <Share2 className="h-5 w-5" />
            </button>
            <button
              onClick={handleEmailShare}
              className="p-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-all duration-200"
              title="Share via email"
            >
              <Mail className="h-5 w-5" />
            </button>
            <button
              onClick={() => navigate(`/itinerary-builder/${trip.id}`)}
              className="p-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-all duration-200"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button className="p-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-all duration-200">
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              viewMode === 'timeline'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Timeline View
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              viewMode === 'calendar'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Calendar View
          </button>
        </div>
      </div>

      {/* Itinerary Content */}
      {viewMode === 'timeline' ? (
        <div className="space-y-6">
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
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <h3 className="text-2xl font-bold text-white">
                            {stop.city.name}, {stop.city.country}
                          </h3>
                        </div>
                        <p className="text-slate-200">{stop.city.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{stopDuration} days</p>
                        <p className="text-green-400">${stopCost}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stop Details */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-2">ARRIVAL</h4>
                      <p className="text-white">{format(new Date(stop.arrivalDate), 'EEEE, MMMM d, yyyy')}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-400 mb-2">DEPARTURE</h4>
                      <p className="text-white">{format(new Date(stop.departureDate), 'EEEE, MMMM d, yyyy')}</p>
                    </div>
                  </div>

                  {/* Activities */}
                  {stop.activities.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-4">Activities & Experiences</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stop.activities.map((activity) => (
                          <div key={activity.id} className="bg-slate-700/30 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="font-medium text-white">{activity.name}</h5>
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                                {activity.category}
                              </span>
                            </div>
                            <p className="text-sm text-slate-400 mb-3">{activity.description}</p>
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
        </div>
      ) : (
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-6">Calendar View</h3>
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-slate-400 py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="text-center py-16">
            <Calendar className="h-16 w-16 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">Calendar view coming soon</p>
          </div>
        </div>
      )}

      {/* Trip Summary */}
      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Trip Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{totalDuration}</p>
            <p className="text-sm text-slate-400">Days</p>
          </div>
          <div className="text-center">
            <div className="h-12 w-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">{trip.stops.length}</p>
            <p className="text-sm text-slate-400">Destinations</p>
          </div>
          <div className="text-center">
            <div className="h-12 w-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">
              {trip.stops.reduce((sum, stop) => sum + stop.activities.length, 0)}
            </p>
            <p className="text-sm text-slate-400">Activities</p>
          </div>
          <div className="text-center">
            <div className="h-12 w-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <p className="text-2xl font-bold text-white">${totalCost}</p>
            <p className="text-sm text-slate-400">Total Cost</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryView;