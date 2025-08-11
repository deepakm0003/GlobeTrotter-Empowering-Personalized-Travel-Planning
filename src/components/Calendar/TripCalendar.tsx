import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  MapPin, 
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical,
  ChevronDown,
  ChevronUp,
  Save,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  addMonths, 
  subMonths,
  addDays,
  differenceInDays
} from 'date-fns';
import { Trip, TripStop, Activity } from '../../types';
import { fetchMyTrips } from '../../data/mockData';
import toast from 'react-hot-toast';

interface DayActivity {
  id: string;
  tripId: string;
  tripName: string;
  cityName: string;
  activity: Activity;
  date: Date;
  stopId: string;
}

interface NewEvent {
  tripId: string;
  stopId: string;
  name: string;
  description: string;
  date: string;
  duration: number;
  cost: number;
  category: string;
}

const TripCalendar: React.FC = () => {
  const { trips, setTrips, user } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newEvent, setNewEvent] = useState<NewEvent>({
    tripId: '',
    stopId: '',
    name: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    duration: 2,
    cost: 0,
    category: 'sightseeing'
  });

  // Load trips when component mounts
  useEffect(() => {
    const loadTrips = async () => {
      if (user?.id) {
        try {
          setLoading(true);
          const userTrips = await fetchMyTrips(user.id);
          setTrips(userTrips);
        } catch (error) {
          console.error('Failed to load trips:', error);
          toast.error('Failed to load trips');
        } finally {
          setLoading(false);
        }
      }
    };

    loadTrips();
  }, [user?.id, setTrips]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get all activities for the current month
  const getAllActivitiesForMonth = (): DayActivity[] => {
    const activities: DayActivity[] = [];
    
    trips.forEach(trip => {
      trip.stops?.forEach(stop => {
        const stopStart = new Date(stop.arrivalDate);
        const stopEnd = new Date(stop.departureDate);
        
        // Check if stop overlaps with current month
        if (stopStart <= monthEnd && stopEnd >= monthStart) {
          stop.activities?.forEach(activity => {
            // For simplicity, assign activities to arrival date
            // In a real app, you'd have specific activity dates
            activities.push({
              id: `${trip.id}-${stop.id}-${activity.id}`,
              tripId: trip.id,
              tripName: trip.name,
              cityName: stop.city.name,
              activity,
              date: stopStart,
              stopId: stop.id
            });
          });
        }
      });
    });
    
    return activities;
  };

  // Get activities for a specific date
  const getActivitiesForDate = (date: Date): DayActivity[] => {
    return getAllActivitiesForMonth().filter(activity => 
      isSameDay(activity.date, date)
    );
  };

  // Toggle day expansion
  const toggleDayExpansion = (dateString: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(dateString)) {
      newExpanded.delete(dateString);
    } else {
      newExpanded.add(dateString);
    }
    setExpandedDays(newExpanded);
  };

  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination || !selectedDate) return;

    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const activities = getActivitiesForDate(selectedDate);
    
    const reorderedActivities = Array.from(activities);
    const [removed] = reorderedActivities.splice(result.source.index, 1);
    reorderedActivities.splice(result.destination.index, 0, removed);

    // Update the trips data with reordered activities
    // This is a simplified implementation - in a real app you'd update the backend
    toast.success('Activities reordered successfully!');
  };

  const handleEditActivity = (activityId: string) => {
    setEditingActivity(activityId);
  };

  const handleSaveActivity = (activityId: string, updatedActivity: Partial<Activity>) => {
    const updatedTrips = trips.map(trip => ({
      ...trip,
      stops: trip.stops?.map(stop => ({
        ...stop,
        activities: stop.activities?.map(activity =>
          activity.id === activityId ? { ...activity, ...updatedActivity } : activity
        )
      }))
    }));
    setTrips(updatedTrips);
    setEditingActivity(null);
    toast.success('Activity updated successfully!');
  };

  const handleDeleteActivity = (activityId: string) => {
    const updatedTrips = trips.map(trip => ({
      ...trip,
      stops: trip.stops?.map(stop => ({
        ...stop,
        activities: stop.activities?.filter(activity => activity.id !== activityId)
      }))
    }));
    setTrips(updatedTrips);
    toast.success('Activity deleted successfully!');
  };

  // Add new event
  const handleAddEvent = () => {
    if (!newEvent.tripId || !newEvent.stopId || !newEvent.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newActivity: Activity = {
      id: Date.now().toString(),
      name: newEvent.name,
      description: newEvent.description,
      category: newEvent.category as any,
      cost: newEvent.cost,
      duration: newEvent.duration,
      rating: 0,
      imageUrl: '',
      cityId: '',
      isBooked: false
    };

    const updatedTrips = trips.map(trip => {
      if (trip.id === newEvent.tripId) {
        return {
          ...trip,
          stops: trip.stops?.map(stop => {
            if (stop.id === newEvent.stopId) {
              return {
                ...stop,
                activities: [...(stop.activities || []), newActivity]
              };
            }
            return stop;
          })
        };
      }
      return trip;
    });

    setTrips(updatedTrips);
    setShowAddEvent(false);
    setNewEvent({
      tripId: '',
      stopId: '',
      name: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      duration: 2,
      cost: 0,
      category: 'sightseeing'
    });
    toast.success('Event added successfully!');
  };

  // Get all stops for a trip
  const getStopsForTrip = (tripId: string) => {
    const trip = trips.find(t => t.id === tripId);
    console.log('Selected trip:', trip); // Debug log
    console.log('Trip stops:', trip?.stops); // Debug log
    return trip?.stops || [];
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
  };

  const isDateInTrip = (date: Date): boolean => {
    return trips.some(trip => {
      const tripStart = new Date(trip.startDate);
      const tripEnd = new Date(trip.endDate);
      return date >= tripStart && date <= tripEnd;
    });
  };

  const getDateTrips = (date: Date): Trip[] => {
    return trips.filter(trip => {
      const tripStart = new Date(trip.startDate);
      const tripEnd = new Date(trip.endDate);
      return date >= tripStart && date <= tripEnd;
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Trip Calendar</h1>
            <p className="text-slate-400 mt-1">Loading your travel schedule...</p>
          </div>
        </div>
        <div className="text-center py-16">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-slate-400 mt-4">Loading trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Trip Calendar</h1>
          <p className="text-slate-400 mt-1">Manage your travel schedule and activities</p>
        </div>
        <button
          onClick={() => setShowAddEvent(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Event</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Calendar View</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5 text-white" />
              </button>
              <span className="text-white font-medium">
                {format(currentDate, 'MMMM yyyy')}
              </span>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-slate-400">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map(day => {
              const dateString = format(day, 'yyyy-MM-dd');
              const isExpanded = expandedDays.has(dateString);
              const dayActivities = getActivitiesForDate(day);
              const hasTrips = isDateInTrip(day);
              const dateTrips = getDateTrips(day);

              return (
                <div
                  key={dateString}
                  className={`
                    min-h-[80px] p-2 border border-slate-700/50 rounded-lg cursor-pointer transition-all
                    ${isToday(day) ? 'bg-blue-600/20 border-blue-500/50' : 'bg-slate-700/30'}
                    ${hasTrips ? 'border-green-500/50 bg-green-500/10' : ''}
                    ${isExpanded ? 'bg-slate-600/50' : ''}
                  `}
                  onClick={() => toggleDayExpansion(dateString)}
                >
                  <div className="text-sm font-medium text-white mb-1">
                    {format(day, 'd')}
                  </div>
                  
                  {dateTrips.length > 0 && (
                    <div className="text-xs text-green-400 mb-1">
                      {dateTrips.length} trip{dateTrips.length > 1 ? 's' : ''}
                    </div>
                  )}

                  {dayActivities.length > 0 && (
                    <div className="text-xs text-blue-400 mb-1">
                      {dayActivities.length} activit{dayActivities.length > 1 ? 'ies' : 'y'}
                    </div>
                  )}

                  {isExpanded && hasTrips && (
                    <div className="mt-2 space-y-2">
                      <div className="space-y-1">
                        {dayActivities.map((dayActivity) => (
                          <div
                            key={dayActivity.id}
                            className="bg-slate-600/50 rounded p-1 text-xs"
                          >
                            <div className="flex items-center space-x-1">
                              <GripVertical className="h-3 w-3 text-slate-400" />
                              <span className="truncate">{dayActivity.activity.name}</span>
                              <div className="flex space-x-1 ml-auto">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditActivity(dayActivity.activity.id);
                                  }}
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  <Edit className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteActivity(dayActivity.activity.id);
                                  }}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Timeline View */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Timeline View</h3>
          <div className="space-y-4">
            {trips.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">No trips planned yet</p>
                <p className="text-sm text-slate-500">Create a trip to see it in the timeline</p>
              </div>
            ) : (
              trips.map(trip => {
                const tripStart = new Date(trip.startDate);
                const tripEnd = new Date(trip.endDate);
                const duration = differenceInDays(tripEnd, tripStart) + 1;

                return (
                  <div key={trip.id} className="border-l-2 border-blue-500 pl-4">
                    <div className="mb-2">
                      <h4 className="font-medium text-white">{trip.name}</h4>
                      <p className="text-sm text-slate-400">
                        {format(tripStart, 'MMM d')} - {format(tripEnd, 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-blue-400">{duration} days</p>
                    </div>
                    
                    {trip.stops?.map((stop, index) => (
                      <div key={stop.id} className="ml-4 mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-sm text-white">{stop.city.name}</span>
                        </div>
                        {stop.activities?.length > 0 && (
                          <div className="ml-4 mt-1">
                            {stop.activities.slice(0, 2).map(activity => (
                              <div key={activity.id} className="text-xs text-slate-400">
                                • {activity.name}
                              </div>
                            ))}
                            {stop.activities.length > 2 && (
                              <div className="text-xs text-slate-500">
                                +{stop.activities.length - 2} more activities
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Add New Event</h3>
              <button
                onClick={() => setShowAddEvent(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Trip Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Select Trip *</label>
                <select
                  value={newEvent.tripId}
                  onChange={(e) => {
                    console.log('Selected trip ID:', e.target.value); // Debug log
                    setNewEvent({ ...newEvent, tripId: e.target.value, stopId: '' });
                  }}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a trip</option>
                  {trips.map(trip => (
                    <option key={trip.id} value={trip.id}>{trip.name}</option>
                  ))}
                </select>
              </div>

              {/* Stop Selection */}
              {newEvent.tripId && (
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Select Destination *</label>
                  {(() => {
                    const stops = getStopsForTrip(newEvent.tripId);
                    console.log('Available stops:', stops); // Debug log
                    
                    if (stops.length === 0) {
                      return (
                        <div className="text-amber-400 text-sm p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                          <p>No destinations found for this trip.</p>
                          <p className="text-xs mt-1">Please add destinations to your trip first.</p>
                        </div>
                      );
                    }
                    
                    return (
                      <select
                        value={newEvent.stopId}
                        onChange={(e) => setNewEvent({ ...newEvent, stopId: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Choose a destination</option>
                        {stops.map(stop => (
                          <option key={stop.id} value={stop.id}>
                            {stop.city.name} ({format(new Date(stop.arrivalDate), 'MMM d')} - {format(new Date(stop.departureDate), 'MMM d')})
                          </option>
                        ))}
                      </select>
                    );
                  })()}
                </div>
              )}

              {/* Event Name */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Event Name *</label>
                <input
                  type="text"
                  value={newEvent.name}
                  onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter event name"
                />
              </div>

              {/* Event Description */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter event description"
                  rows={3}
                />
              </div>

              {/* Event Date */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Event Date</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Duration and Cost */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Duration (hours)</label>
                  <input
                    type="number"
                    value={newEvent.duration}
                    onChange={(e) => setNewEvent({ ...newEvent, duration: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Cost ($)</label>
                  <input
                    type="number"
                    value={newEvent.cost}
                    onChange={(e) => setNewEvent({ ...newEvent, cost: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Category</label>
                <select
                  value={newEvent.category}
                  onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="sightseeing">Sightseeing</option>
                  <option value="food">Food & Dining</option>
                  <option value="adventure">Adventure</option>
                  <option value="culture">Culture</option>
                  <option value="nightlife">Nightlife</option>
                  <option value="shopping">Shopping</option>
                  <option value="nature">Nature</option>
                  <option value="relaxation">Relaxation</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddEvent(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Event</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Edit Modal */}
      {editingActivity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Edit Activity</h3>
              <button
                onClick={() => setEditingActivity(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Activity Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Activity name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Duration (hours)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">Cost ($)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setEditingActivity(null)}
                className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSaveActivity(editingActivity, {});
                  setEditingActivity(null);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripCalendar;