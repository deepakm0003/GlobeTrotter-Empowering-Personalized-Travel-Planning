import React, { useState, useEffect } from 'react';
import { Brain, Calendar, DollarSign, MapPin, Star, Clock, Sparkles, TrendingUp, Users, Heart } from 'lucide-react';
import { City, Activity } from '../../types';

interface AITripPlan {
  city: City;
  itinerary: Array<{
    day: number;
    activities: {
      morning: Activity[];
      afternoon: Activity[];
      evening: Activity[];
    };
    totalCost: number;
    totalDuration: number;
  }>;
  budgetAnalysis: {
    activities: number;
    accommodation: number;
    transportation: number;
    food: number;
    miscellaneous: number;
    total: number;
    dailyAverage: number;
    budgetCategory: string;
  };
  recommendations: Activity[];
  travelInsights: any;
}

interface AITripPlannerProps {
  cityId?: number;
  onTripCreated?: (trip: any) => void;
}

const AITripPlanner: React.FC<AITripPlannerProps> = ({ cityId, onTripCreated }) => {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [aiPlan, setAiPlan] = useState<AITripPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    fetchCities();
    if (cityId) {
      fetchCityDetails(cityId);
    }
  }, [cityId]);

  const fetchCities = async () => {
    try {
      const response = await fetch('/api/cities');
      if (response.ok) {
        const citiesData = await response.json();
        setCities(citiesData);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchCityDetails = async (id: number) => {
    try {
      const response = await fetch(`/api/cities/${id}`);
      if (response.ok) {
        const cityData = await response.json();
        setSelectedCity(cityData);
      }
    } catch (error) {
      console.error('Error fetching city details:', error);
    }
  };

  const generateAIPlan = async () => {
    if (!selectedCity) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/plan-trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cityId: selectedCity.id,
          tripDuration: 7,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiPlan(data.aiPlan);
        setShowPlanDetails(true);
      }
    } catch (error) {
      console.error('Error generating AI plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAITrip = async () => {
    if (!selectedCity || !aiPlan || !tripName || !startDate || !endDate) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/create-trip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cityId: selectedCity.id,
          tripName: tripName,
          startDate: startDate,
          endDate: endDate,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert('🎉 AI-planned trip created successfully! Check your trips for the detailed itinerary.');
        onTripCreated?.(data.trip);
        setShowPlanDetails(false);
        setTripName('');
        setStartDate('');
        setEndDate('');
      }
    } catch (error) {
      console.error('Error creating AI trip:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBudgetCategoryColor = (category: string) => {
    switch (category) {
      case 'budget': return 'text-green-400 bg-green-500/20';
      case 'moderate': return 'text-yellow-400 bg-yellow-500/20';
      case 'luxury': return 'text-orange-400 bg-orange-500/20';
      case 'premium': return 'text-red-400 bg-red-500/20';
      default: return 'text-blue-400 bg-blue-500/20';
    }
  };

  const getTimeSlotColor = (timeSlot: string) => {
    switch (timeSlot) {
      case 'morning': return 'text-blue-400 bg-blue-500/20';
      case 'afternoon': return 'text-orange-400 bg-orange-500/20';
      case 'evening': return 'text-purple-400 bg-purple-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Brain className="h-8 w-8 text-blue-400" />
          <h1 className="text-3xl font-bold text-white">AI Trip Planner</h1>
          <Sparkles className="h-8 w-8 text-yellow-400" />
        </div>
        <p className="text-slate-400">
          Let our AI create the perfect personalized trip for you based on your preferences and travel history
        </p>
      </div>

      {/* City Selection */}
      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Choose Your Destination</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cities.slice(0, 9).map((city) => (
            <button
              key={city.id}
              onClick={() => setSelectedCity(city)}
              className={`p-4 rounded-lg border transition-all duration-200 text-left ${
                selectedCity?.id === city.id
                  ? 'border-blue-500 bg-blue-500/20'
                  : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
              }`}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={city.imageUrl}
                  alt={city.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-semibold text-white">{city.name}</h3>
                  <p className="text-sm text-slate-400">{city.country}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* AI Plan Generation */}
      {selectedCity && (
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">AI Trip Plan for {selectedCity.name}</h2>
              <p className="text-slate-400">Personalized recommendations based on your travel style</p>
            </div>
            <button
              onClick={generateAIPlan}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Planning...</span>
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  <span>Generate AI Plan</span>
                </>
              )}
            </button>
          </div>

          {selectedCity && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="h-5 w-5 text-blue-400" />
                  <span className="text-white font-medium">Location</span>
                </div>
                <p className="text-slate-300">{selectedCity.name}, {selectedCity.country}</p>
                <p className="text-sm text-slate-400">{selectedCity.region}</p>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  <span className="text-white font-medium">Cost Index</span>
                </div>
                <p className="text-slate-300">{selectedCity.costIndex}</p>
                <p className="text-sm text-slate-400">${selectedCity.averageDailyCost}/day avg</p>
              </div>
              
              <div className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-yellow-400" />
                  <span className="text-white font-medium">Popularity</span>
                </div>
                <p className="text-slate-300">{selectedCity.popularity}%</p>
                <p className="text-sm text-slate-400">Highly rated destination</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Plan Details */}
      {aiPlan && showPlanDetails && (
        <div className="space-y-6">
          {/* Budget Analysis */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Budget Analysis</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">${aiPlan.budgetAnalysis.activities}</div>
                <div className="text-sm text-slate-400">Activities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">${aiPlan.budgetAnalysis.accommodation}</div>
                <div className="text-sm text-slate-400">Accommodation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">${aiPlan.budgetAnalysis.transportation}</div>
                <div className="text-sm text-slate-400">Transportation</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">${aiPlan.budgetAnalysis.food}</div>
                <div className="text-sm text-slate-400">Food</div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">${aiPlan.budgetAnalysis.total}</div>
              <div className="text-lg text-slate-400">Total Estimated Cost</div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getBudgetCategoryColor(aiPlan.budgetAnalysis.budgetCategory)}`}>
                {aiPlan.budgetAnalysis.budgetCategory.toUpperCase()} TRIP
              </span>
            </div>
          </div>

          {/* Daily Itinerary */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">AI-Optimized Itinerary</h3>
            <div className="space-y-4">
              {aiPlan.itinerary.map((day, index) => (
                <div key={index} className="border border-slate-600 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-3">Day {day.day}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['morning', 'afternoon', 'evening'].map((timeSlot) => (
                      <div key={timeSlot} className="space-y-2">
                        <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getTimeSlotColor(timeSlot)}`}>
                          <Clock className="h-4 w-4" />
                          <span className="capitalize">{timeSlot}</span>
                        </div>
                        <div className="space-y-2">
                          {day.activities[timeSlot]?.map((activity, activityIndex) => (
                            <div key={activityIndex} className="bg-slate-700/30 rounded-lg p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h5 className="font-medium text-white text-sm">{activity.name}</h5>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <Star className="h-3 w-3 text-yellow-400" />
                                    <span className="text-xs text-slate-400">{activity.rating}</span>
                                    <DollarSign className="h-3 w-3 text-green-400" />
                                    <span className="text-xs text-slate-400">${activity.cost}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Create Trip Form */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Create Your AI-Planned Trip</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Trip Name</label>
                <input
                  type="text"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  placeholder="My AI-Planned Trip"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={createAITrip}
              disabled={loading || !tripName || !startDate || !endDate}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Creating Trip...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  <span>Create AI-Planned Trip</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AITripPlanner;
