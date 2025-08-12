import React, { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, DollarSign, Share2, Edit, Trash2, Eye, Filter, SortAsc, Mail, Link, Copy, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { format, differenceInDays } from 'date-fns';
import { Trip } from '../../types';
import { fetchMyTrips } from '../../data/mockData';
import toast from 'react-hot-toast';

const TripsList = () => {
  const navigate = useNavigate();
  const { user, trips, setTrips, isLoading, setIsLoading } = useApp();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [shareEmail, setShareEmail] = useState('');
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    const loadTrips = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const userTrips = await fetchMyTrips(user.id);
          setTrips(userTrips);
        } catch (error) {
          console.error('Error loading trips:', error);
          toast.error('Failed to load trips');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadTrips();
  }, [user, setTrips, setIsLoading]);

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;

    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user?.id || '',
        },
      });

      if (response.ok) {
        setTrips(prev => prev.filter((trip: Trip) => trip.id !== tripId));
        toast.success('Trip deleted successfully');
      } else {
        toast.error('Failed to delete trip');
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast.error('Failed to delete trip');
    }
  };

  const handleShareTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowShareModal(true);
  };

  const handleEmailShare = () => {
    setShowShareModal(false);
    setShowEmailModal(true);
  };

  const sendEmailShare = async () => {
    if (!selectedTrip || !shareEmail) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Get the JWT token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to share itineraries');
      return;
    }

    try {
      console.log('Sending email share:', { tripId: selectedTrip.id, email: shareEmail });
      
      const response = await fetch('/api/trips/share-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          tripId: selectedTrip.id,
          recipientEmail: shareEmail
        }),
      });

      console.log('Email share response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('Email share successful:', result);
        toast.success('Itinerary shared successfully!');
        setShowEmailModal(false);
        setShareEmail('');
      } else {
        const error = await response.json();
        console.error('Email share error:', error);
        toast.error(error.error || 'Failed to share itinerary');
      }
    } catch (error) {
      console.error('Error sharing trip:', error);
      toast.error('Failed to share itinerary. Please try again.');
    }
  };

  const handleLinkShare = async () => {
    if (!selectedTrip) return;
    
    // Get the JWT token from localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to share itineraries');
      return;
    }
    
    try {
      console.log('Generating share link for trip:', selectedTrip.id);
      
      // Show loading state
      toast.loading('Creating shareable link...', { id: 'share-link' });
      
      // Use the share-link endpoint which properly handles authentication
      const shareResponse = await fetch(`/api/trips/${selectedTrip.id}/share-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Share link response status:', shareResponse.status);

      if (shareResponse.ok) {
        const result = await shareResponse.json();
        console.log('Share link generated successfully:', result);
        
        // Use the share URL from the response
        const shareUrl = result.shareUrl || `${window.location.origin}/shared-trip/${selectedTrip.id}`;
        setShareLink(shareUrl);
        setShowShareModal(false);
        
        // Dismiss loading toast and show success
        toast.dismiss('share-link');
        toast.success('Shareable link created successfully!');
        
        // Refresh the trips list to update the public status
        if (user) {
          const userTrips = await fetchMyTrips(user.id);
          setTrips(userTrips);
        }
      } else {
        const error = await shareResponse.json();
        console.error('Share link error:', error);
        
        // Dismiss loading toast and show error
        toast.dismiss('share-link');
        toast.error(error.error || 'Failed to create shareable link');
      }
    } catch (error) {
      console.error('Error creating shareable link:', error);
      
      // Dismiss loading toast and show error
      toast.dismiss('share-link');
      toast.error('Failed to create shareable link. Please try again.');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const filteredTrips = trips.filter(trip => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return new Date(trip.startDate) > new Date();
    if (filter === 'past') return new Date(trip.endDate) < new Date();
    return true;
  });

  const sortedTrips = [...filteredTrips].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'budget') return (b.estimatedCost || 0) - (a.estimatedCost || 0);
    return 0;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Trip</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Filter className="h-4 w-4" />
          <span>All Trips</span>
        </button>
        <button
          onClick={() => setSortBy(sortBy === 'date' ? 'name' : 'date')}
          className="px-4 py-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 flex items-center space-x-2 transition-colors"
        >
          <SortAsc className="h-4 w-4" />
          <span>Sort by {sortBy === 'date' ? 'Date' : 'Name'}</span>
        </button>
      </div>

      {/* Trip Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedTrips.map((trip) => (
          <div key={trip.id} className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-lg border border-slate-700/50 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
            {/* Trip Image */}
            {trip.coverPhoto ? (
              <div className="relative h-48 bg-gradient-to-br from-purple-600 to-blue-600">
                <img
                  src={trip.coverPhoto}
                  alt={trip.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-purple-600/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                  {trip.stops?.length || 0} stops
                </div>
              </div>
            ) : (
              <div className="relative h-48 bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <MapPin className="h-12 w-12 text-white/50" />
                <div className="absolute top-3 right-3 bg-purple-600/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                  {trip.stops?.length || 0} stops
                </div>
              </div>
            )}

            {/* Trip Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-1">{trip.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{trip.description}</p>
              
              {/* Trip Details */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center space-x-2 text-sm">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300">{differenceInDays(new Date(trip.endDate), new Date(trip.startDate))} days</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300">{trip.destinationCity}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-300">${trip.estimatedCost?.toFixed(2) || '0.00'}</span>
        </div>
      </div>

              <p className="text-slate-400 text-sm mb-4">
                {format(new Date(trip.startDate), 'MMM dd, yyyy')} - {format(new Date(trip.endDate), 'MMM dd, yyyy')}
              </p>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleShareTrip(trip)}
                  className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                  title="Share Trip"
                >
                  <Share2 className="h-4 w-4 text-slate-400" />
                </button>
                <button
                  onClick={() => handleDeleteTrip(trip.id)}
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
                  onClick={() => navigate(`/itinerary-builder/${trip.id}`)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Manage Itinerary</span>
                </button>
              </div>
            </div>
          </div>
          ))}
        </div>

      {/* Empty State */}
      {sortedTrips.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No trips yet</h3>
          <p className="text-slate-400 mb-6">Start planning your next adventure by creating your first trip</p>
          <button
            onClick={() => navigate('/trips/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Your First Trip</span>
          </button>
        </div>
      )}

      {/* Share Options Modal */}
      {showShareModal && selectedTrip && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Share Trip</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <h4 className="text-white font-medium mb-2">{selectedTrip.name}</h4>
                <p className="text-slate-400 text-sm">{selectedTrip.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleEmailShare}
                  className="flex flex-col items-center space-y-2 p-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <Mail className="h-6 w-6 text-white" />
                  <span className="text-white font-medium">Share via Email</span>
                  <span className="text-blue-200 text-xs">Send PDF directly</span>
                </button>

                <button
                  onClick={handleLinkShare}
                  className="flex flex-col items-center space-y-2 p-4 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
                >
                  <Link className="h-6 w-6 text-white" />
                  <span className="text-white font-medium">Share Link</span>
                  <span className="text-green-200 text-xs">Public viewable link</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Share Modal */}
      {showEmailModal && selectedTrip && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Share via Email</h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-4 bg-slate-700/30 rounded-lg">
                <h4 className="text-white font-medium mb-2">What will be shared:</h4>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>• Complete trip itinerary PDF</li>
                  <li>• Trip details and stops</li>
                  <li>• Budget information</li>
                  <li>• Trip cover image</li>
                </ul>
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={sendEmailShare}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Send Email
                </button>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Link Share Modal */}
      {shareLink && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Share Link</h3>
              <button
                onClick={() => setShareLink('')}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Shareable Link
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white"
                  />
                  <button
                    onClick={() => copyToClipboard(shareLink)}
                    className="p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    title="Copy link"
                  >
                    <Copy className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-700/30 rounded-lg">
                <h4 className="text-white font-medium mb-2">Link Features:</h4>
                <ul className="text-slate-400 text-sm space-y-1">
                  <li>• Public viewable itinerary</li>
                  <li>• No login required</li>
                  <li>• Works on any device</li>
                  <li>• Can be shared anywhere</li>
                </ul>
              </div>

              <button
                onClick={() => setShareLink('')}
                className="w-full bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripsList;