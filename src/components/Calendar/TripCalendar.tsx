import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock, Plus, Edit } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';

const TripCalendar: React.FC = () => {
  const { trips } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get trips for the current month
  const monthTrips = trips.filter(trip => {
    const tripStart = new Date(trip.startDate);
    const tripEnd = new Date(trip.endDate);
    return (
      (tripStart >= monthStart && tripStart <= monthEnd) ||
      (tripEnd >= monthStart && tripEnd <= monthEnd) ||
      (tripStart <= monthStart && tripEnd >= monthEnd)
    );
  });

  // Get activities for a specific date
  const getActivitiesForDate = (date: Date) => {
    const activities: Array<{ tripName: string; cityName: string; activities: any[] }> = [];
    
    monthTrips.forEach(trip => {
      trip.stops.forEach(stop => {
        const stopStart = new Date(stop.arrivalDate);
        const stopEnd = new Date(stop.departureDate);
        
        if (date >= stopStart && date <= stopEnd) {
          activities.push({
            tripName: trip.name,
            cityName: stop.city.name,
            activities: stop.activities
          });
        }
      });
    });
    
    return activities;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Trip Calendar</h1>
          <p className="text-slate-400 mt-1">View your travel schedule and activities</p>
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add Event</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-slate-400 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {daysInMonth.map((day) => {
              const dayActivities = getActivitiesForDate(day);
              const hasActivities = dayActivities.length > 0;
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    relative p-3 text-left rounded-lg transition-all duration-200 min-h-[80px]
                    ${isSelected 
                      ? 'bg-blue-500/20 border border-blue-500/50 text-blue-400' 
                      : 'hover:bg-slate-700/50 text-white'
                    }
                    ${isTodayDate ? 'ring-2 ring-blue-500/30' : ''}
                    ${!isSameMonth(day, currentDate) ? 'text-slate-600' : ''}
                  `}
                >
                  <div className="text-sm font-medium mb-1">
                    {format(day, 'd')}
                  </div>
                  {hasActivities && (
                    <div className="space-y-1">
                      {dayActivities.slice(0, 2).map((activity, index) => (
                        <div
                          key={index}
                          className="text-xs bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-blue-300 px-2 py-1 rounded truncate"
                        >
                          {activity.cityName}
                        </div>
                      ))}
                      {dayActivities.length > 2 && (
                        <div className="text-xs text-slate-400">
                          +{dayActivities.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Details */}
          {selectedDate && (
            <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </h3>
              
              {getActivitiesForDate(selectedDate).length > 0 ? (
                <div className="space-y-4">
                  {getActivitiesForDate(selectedDate).map((tripActivity, index) => (
                    <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">{tripActivity.tripName}</h4>
                        <button className="p-1 text-slate-400 hover:text-white">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-slate-400 mb-3 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {tripActivity.cityName}
                      </p>
                      
                      {tripActivity.activities.length > 0 && (
                        <div className="space-y-2">
                          {tripActivity.activities.map((activity) => (
                            <div key={activity.id} className="text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-white">{activity.name}</span>
                                <span className="flex items-center text-slate-400">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {activity.duration}h
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400">No activities scheduled</p>
                </div>
              )}
            </div>
          )}

          {/* Upcoming Trips */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Upcoming Trips</h3>
            <div className="space-y-3">
              {monthTrips.slice(0, 3).map((trip) => (
                <div key={trip.id} className="bg-slate-700/30 rounded-lg p-3">
                  <h4 className="font-medium text-white text-sm">{trip.name}</h4>
                  <p className="text-xs text-slate-400">
                    {format(new Date(trip.startDate), 'MMM d')} - {format(new Date(trip.endDate), 'MMM d')}
                  </p>
                  <p className="text-xs text-blue-400">{trip.stops.length} stops</p>
                </div>
              ))}
              {monthTrips.length === 0 && (
                <p className="text-slate-400 text-sm">No trips this month</p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">This Month</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Trips</span>
                <span className="text-white font-medium">{monthTrips.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Cities</span>
                <span className="text-white font-medium">
                  {monthTrips.reduce((sum, trip) => sum + trip.stops.length, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Activities</span>
                <span className="text-white font-medium">
                  {monthTrips.reduce((sum, trip) => 
                    sum + trip.stops.reduce((stopSum, stop) => stopSum + stop.activities.length, 0), 0
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripCalendar;