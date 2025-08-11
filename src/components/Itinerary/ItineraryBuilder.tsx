import React, { useState } from 'react';
import { Plus, MapPin, Calendar, Clock, DollarSign, Trash2, GripVertical } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { mockCities, mockActivities } from '../../data/mockData';
import { TripStop, City, Activity } from '../../types';
import toast from 'react-hot-toast';

const ItineraryBuilder: React.FC = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { trips, setTrips, currentTrip, setCurrentTrip } = useApp();
  
  const [selectedTrip, setSelectedTrip] = useState(() => {
    return trips.find(trip => trip.id === tripId) || currentTrip;
  });
  
  const [showCitySearch, setShowCitySearch] = useState(false);
  const [showActivitySearch, setShowActivitySearch] = useState(false);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);

  const addStop = (city: City) => {
    if (!selectedTrip) return;

    const newStop: TripStop = {
      id: Date.now().toString(),
      tripId: selectedTrip.id,
      cityId: city.id,
      city: city,
      arrivalDate: selectedTrip.startDate,
      departureDate: selectedTrip.startDate,
      accommodation: '',
      accommodationCost: 0,
      transportCost: 0,
      activities: [],
      order: selectedTrip.stops.length + 1,
    };

    const updatedTrip = {
      ...selectedTrip,
      stops: [...selectedTrip.stops, newStop]
    };

    setSelectedTrip(updatedTrip);
    setTrips(trips.map(trip => trip.id === selectedTrip.id ? updatedTrip : trip));
    setShowCitySearch(false);
    toast.success(`${city.name} added to your trip!`);
  };

  const removeStop = (stopId: string) => {
    if (!selectedTrip) return;

    const updatedTrip = {
      ...selectedTrip,
      stops: selectedTrip.stops.filter(stop => stop.id !== stopId)
    };

    setSelectedTrip(updatedTrip);
    setTrips(trips.map(trip => trip.id === selectedTrip.id ? updatedTrip : trip));
    toast.success('Stop removed from trip');
  };

  const addActivityToStop = (activity: Activity, stopId: string) => {
    if (!selectedTrip) return;

    const updatedTrip = {
      ...selectedTrip,
      stops: selectedTrip.stops.map(stop => 
        stop.id === stopId 
          ? { ...stop, activities: [...stop.activities, activity] }
          : stop
      )
    };

    setSelectedTrip(updatedTrip);
    setTrips(trips.map(trip => trip.id === selectedTrip.id ? updatedTrip : trip));
    setShowActivitySearch(false);
    setSelectedStopId(null);
    toast.success(`${activity.name} added to ${selectedTrip.stops.find(s => s.id === stopId)?.city.name}!`);
  };

  const updateStopDates = (stopId: string, field: 'arrivalDate' | 'departureDate', value: string) => {
    if (!selectedTrip) return;

    const updatedTrip = {
      ...selectedTrip,
      stops: selectedTrip.stops.map(stop => 
        stop.id === stopId ? { ...stop, [field]: value } : stop
      )
    };

    setSelectedTrip(updatedTrip);
    setTrips(trips.map(trip => trip.id === selectedTrip.id ? updatedTrip : trip));
  };

  if (!selectedTrip) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{selectedTrip.name}</h1>
          <p className="text-slate-400 mt-1">Build your perfect itinerary</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCitySearch(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Stop</span>
          </button>
          <button
            onClick={() => navigate(`/itinerary/${selectedTrip.id}`)}
            className="bg-slate-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-600 transition-all duration-200"
          >
            Preview Itinerary
          </button>
        </div>
      </div>

      {/* Trip Stops */}
      <div className="space-y-6">
        {selectedTrip.stops.map((stop, index) => (
          <div key={stop.id} className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <MapPin className="h-5 w-5 text-blue-400 mr-2" />
                    {stop.city.name}, {stop.city.country}
                  </h3>
                  <p className="text-slate-400">{stop.city.description}</p>
                </div>
              </div>
              <button
                onClick={() => removeStop(stop.id)}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Arrival Date
                </label>
                <input
                  type="date"
                  value={stop.arrivalDate}
                  onChange={(e) => updateStopDates(stop.id, 'arrivalDate', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Departure Date
                </label>
                <input
                  type="date"
                  value={stop.departureDate}
                  onChange={(e) => updateStopDates(stop.id, 'departureDate', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Activities */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Activities</h4>
                <button
                  onClick={() => {
                    setSelectedStopId(stop.id);
                    setShowActivitySearch(true);
                  }}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-600 transition-all duration-200 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Activity</span>
                </button>
              </div>

              {stop.activities.length > 0 ? (
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
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
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
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-slate-600 rounded-lg">
                  <p className="text-slate-400">No activities added yet</p>
                  <button
                    onClick={() => {
                      setSelectedStopId(stop.id);
                      setShowActivitySearch(true);
                    }}
                    className="text-blue-400 hover:text-blue-300 font-medium mt-2"
                  >
                    Add your first activity
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {selectedTrip.stops.length === 0 && (
          <div className="text-center py-16 bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl">
            <MapPin className="h-16 w-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No stops added yet</h3>
            <p className="text-slate-400 mb-6">Start building your itinerary by adding your first destination</p>
            <button
              onClick={() => setShowCitySearch(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
            >
              Add First Stop
            </button>
          </div>
        )}
      </div>

      {/* City Search Modal */}
      {showCitySearch && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Add Destination</h3>
              <button
                onClick={() => setShowCitySearch(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockCities.map((city) => (
                <div
                  key={city.id}
                  className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-all duration-200 cursor-pointer"
                  onClick={() => addStop(city)}
                >
                  <img
                    src={city.imageUrl}
                    alt={city.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h4 className="font-medium text-white">{city.name}</h4>
                  <p className="text-sm text-slate-400">{city.country}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-green-400">${city.averageDailyCost}/day</span>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-2 rounded-full mr-1 ${
                            i < Math.floor(city.popularity / 20) ? 'bg-yellow-400' : 'bg-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Activity Search Modal */}
      {showActivitySearch && selectedStopId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Add Activity</h3>
              <button
                onClick={() => {
                  setShowActivitySearch(false);
                  setSelectedStopId(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              {mockActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="bg-slate-700/50 rounded-lg p-4 hover:bg-slate-700 transition-all duration-200 cursor-pointer"
                  onClick={() => addActivityToStop(activity, selectedStopId)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-white">{activity.name}</h4>
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
        </div>
      )}
    </div>
  );
};

export default ItineraryBuilder;