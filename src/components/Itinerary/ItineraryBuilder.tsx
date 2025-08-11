import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Calendar, Clock, DollarSign, Trash2, GripVertical, ArrowLeft, Edit, Save, X, Search, Printer } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { mockCities, mockActivities } from '../../data/mockData';
import { Trip, TripStop, Activity } from '../../types';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ItineraryBuilder = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { trips, setTrips } = useApp();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddStop, setShowAddStop] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [stops, setStops] = useState<TripStop[]>([]);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    destinationCity: '',
    destinationCountry: '',
    totalBudget: '',
    estimatedCost: ''
  });

  useEffect(() => {
    if (tripId && trips.length > 0) {
      const trip = trips.find(t => t.id === tripId);
      if (trip) {
        setSelectedTrip(trip);
        setStops(trip.stops || []);
        setEditForm({
          name: trip.name,
          description: trip.description || '',
          startDate: format(new Date(trip.startDate), 'yyyy-MM-dd'),
          endDate: format(new Date(trip.endDate), 'yyyy-MM-dd'),
          destinationCity: trip.destinationCity,
          destinationCountry: trip.destinationCountry,
          totalBudget: trip.totalBudget?.toString() || '',
          estimatedCost: trip.estimatedCost?.toString() || ''
        });
      }
    }
  }, [tripId, trips]);

  const handleEditSave = async () => {
    if (!selectedTrip) return;

    try {
      const response = await fetch(`/api/trips/${selectedTrip.id}`, { // Use proxy URL
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...editForm,
          totalBudget: parseFloat(editForm.totalBudget) || 0,
          estimatedCost: parseFloat(editForm.estimatedCost) || 0
        }),
      });

      if (response.ok) {
        const updatedTrip = await response.json();
        
        // Update trips in context
        const updatedTrips = trips.map(trip => 
          trip.id === selectedTrip.id ? updatedTrip : trip
        );
        setTrips(updatedTrips);
        setSelectedTrip(updatedTrip);
        
        setIsEditing(false);
        toast.success('Trip details updated successfully!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update trip details');
      }
    } catch (error) {
      console.error('Error updating trip:', error);
      toast.error('Failed to update trip details');
    }
  };

  const handleCancelEdit = () => {
    if (selectedTrip) {
      setEditForm({
        name: selectedTrip.name,
        description: selectedTrip.description || '',
        startDate: format(new Date(selectedTrip.startDate), 'yyyy-MM-dd'),
        endDate: format(new Date(selectedTrip.endDate), 'yyyy-MM-dd'),
        destinationCity: selectedTrip.destinationCity,
        destinationCountry: selectedTrip.destinationCountry,
        totalBudget: selectedTrip.totalBudget?.toString() || '',
        estimatedCost: selectedTrip.estimatedCost?.toString() || ''
      });
    }
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddStop = () => {
    if (!selectedCity) {
      toast.error('Please select a destination');
      return;
    }

    const newStop: TripStop = {
      id: `stop-${Date.now()}`,
      cityId: selectedCity.id,
      cityName: selectedCity.name,
      country: selectedCity.country,
      arrivalDate: new Date().toISOString(),
      departureDate: new Date().toISOString(),
      activities: [],
      notes: ''
    };

    const updatedStops = [...stops, newStop];
    setStops(updatedStops);
    
    // Update trip with new stops
    if (selectedTrip) {
      const updatedTrip = { ...selectedTrip, stops: updatedStops };
      setSelectedTrip(updatedTrip);
      
      // Update trips in context
      const updatedTrips = trips.map(trip => 
        trip.id === selectedTrip.id ? updatedTrip : trip
      );
      setTrips(updatedTrips);
    }

    setShowAddStop(false);
    setSelectedCity(null);
    setSearchQuery('');
    toast.success('Stop added successfully!');
  };

  const handleRemoveStop = (stopId: string) => {
    const updatedStops = stops.filter(stop => stop.id !== stopId);
    setStops(updatedStops);
    
    if (selectedTrip) {
      const updatedTrip = { ...selectedTrip, stops: updatedStops };
      setSelectedTrip(updatedTrip);
      
      const updatedTrips = trips.map(trip => 
        trip.id === selectedTrip.id ? updatedTrip : trip
      );
      setTrips(updatedTrips);
    }
    
    toast.success('Stop removed successfully!');
  };

  const filteredCities = mockCities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    city.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const saveItinerary = () => {
    if (!selectedTrip) return;
    
    // Update the trips array with the current trip data
    const updatedTrips = trips.map(trip => 
      trip.id === selectedTrip.id ? selectedTrip : trip
    );
    setTrips(updatedTrips);
    
    // Show success message
    toast.success('Itinerary saved successfully!');
    
    // Redirect to My Trips page
    navigate('/trips');
  };

  const generatePDF = () => {
    if (!selectedTrip) return;

    // Create a new window for PDF generation
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to generate PDF');
      return;
    }

    // Generate HTML content for PDF
    const pdfContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedTrip.name} - Itinerary</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .trip-info {
              margin-bottom: 30px;
            }
            .trip-info table {
              width: 100%;
              border-collapse: collapse;
            }
            .trip-info th, .trip-info td {
              padding: 8px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            .trip-info th {
              background-color: #f8f9fa;
              font-weight: bold;
            }
            .stops-section {
              margin-top: 30px;
            }
            .stop-item {
              margin-bottom: 20px;
              padding: 15px;
              border: 1px solid #ddd;
              border-radius: 8px;
            }
            .stop-number {
              background-color: #3b82f6;
              color: white;
              width: 30px;
              height: 30px;
              border-radius: 50%;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              margin-right: 15px;
              font-weight: bold;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            @media print {
              body { margin: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${selectedTrip.name}</h1>
            <h2>Trip Itinerary</h2>
            <p>Generated on ${format(new Date(), 'MMMM dd, yyyy')}</p>
          </div>

          <div class="trip-info">
            <h3>Trip Details</h3>
            <table>
              <tr>
                <th>Trip Name</th>
                <td>${selectedTrip.name}</td>
              </tr>
              <tr>
                <th>Starting Place</th>
                <td>${selectedTrip.destinationCity}</td>
              </tr>
              <tr>
                <th>Ending Place</th>
                <td>${selectedTrip.destinationCountry}</td>
              </tr>
              <tr>
                <th>Start Date</th>
                <td>${format(new Date(selectedTrip.startDate), 'MMMM dd, yyyy')}</td>
              </tr>
              <tr>
                <th>End Date</th>
                <td>${format(new Date(selectedTrip.endDate), 'MMMM dd, yyyy')}</td>
              </tr>
              <tr>
                <th>Total Budget</th>
                <td>$${selectedTrip.totalBudget?.toFixed(2) || '0.00'}</td>
              </tr>
              <tr>
                <th>Estimated Cost</th>
                <td>$${selectedTrip.estimatedCost?.toFixed(2) || '0.00'}</td>
              </tr>
            </table>
          </div>

          <div class="stops-section">
            <h3>Itinerary Stops</h3>
            ${stops.length > 0 ? 
              stops.map((stop, index) => `
                <div class="stop-item">
                  <div>
                    <span class="stop-number">${index + 1}</span>
                    <strong>${stop.cityName}</strong>, ${stop.country}
                  </div>
                  <div style="margin-left: 45px; margin-top: 10px; color: #666;">
                    <div>Arrival: ${format(new Date(stop.arrivalDate), 'MMM dd, yyyy')}</div>
                    <div>Departure: ${format(new Date(stop.departureDate), 'MMM dd, yyyy')}</div>
                    ${stop.notes ? `<div style="margin-top: 10px;"><strong>Notes:</strong> ${stop.notes}</div>` : ''}
                  </div>
                </div>
              `).join('') : 
              '<p><em>No stops planned yet</em></p>'
            }
          </div>

          <div class="footer">
            <p>Generated by GlobeTrotter - Plan. Explore. Experience.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(pdfContent);
    printWindow.document.close();
  };

  if (!selectedTrip) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-slate-400">Trip not found</p>
          <button 
            onClick={() => navigate('/trips')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Trips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/trips')}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Itinerary Builder</h1>
            <p className="text-slate-400 mt-1">Plan your perfect trip</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={generatePDF}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print PDF</span>
          </button>
          <button
            onClick={saveItinerary}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Itinerary</span>
          </button>
        </div>
      </div>

      {/* Trip Details Table */}
      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Trip Details</h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Trip</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCancelEdit}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        {/* Trip Details Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Field</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Value</th>
              </tr>
            </thead>
            <tbody className="text-white">
              <tr className="border-b border-slate-700/50">
                <td className="py-3 px-4 font-medium">Trip Name</td>
                <td className="py-3 px-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    selectedTrip.name
                  )}
                </td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-3 px-4 font-medium">Starting Place</td>
                <td className="py-3 px-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="destinationCity"
                      value={editForm.destinationCity}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="City"
                    />
                  ) : (
                    selectedTrip.destinationCity
                  )}
                </td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-3 px-4 font-medium">Ending Place</td>
                <td className="py-3 px-4">
                  {isEditing ? (
                    <input
                      type="text"
                      name="destinationCountry"
                      value={editForm.destinationCountry}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Country"
                    />
                  ) : (
                    selectedTrip.destinationCountry
                  )}
                </td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-3 px-4 font-medium">Start Date</td>
                <td className="py-3 px-4">
                  {isEditing ? (
                    <input
                      type="date"
                      name="startDate"
                      value={editForm.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    format(new Date(selectedTrip.startDate), 'MMM dd, yyyy')
                  )}
                </td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-3 px-4 font-medium">End Date</td>
                <td className="py-3 px-4">
                  {isEditing ? (
                    <input
                      type="date"
                      name="endDate"
                      value={editForm.endDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    format(new Date(selectedTrip.endDate), 'MMM dd, yyyy')
                  )}
                </td>
              </tr>
              <tr className="border-b border-slate-700/50">
                <td className="py-3 px-4 font-medium">Total Budget</td>
                <td className="py-3 px-4">
                  {isEditing ? (
                    <input
                      type="number"
                      name="totalBudget"
                      value={editForm.totalBudget}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      step="0.01"
                    />
                  ) : (
                    `$${selectedTrip.totalBudget?.toFixed(2) || '0.00'}`
                  )}
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium">Estimated Cost</td>
                <td className="py-3 px-4">
                  {isEditing ? (
                    <input
                      type="number"
                      name="estimatedCost"
                      value={editForm.estimatedCost}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                      step="0.01"
                    />
                  ) : (
                    `$${selectedTrip.estimatedCost?.toFixed(2) || '0.00'}`
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Itinerary Management Section */}
      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Itinerary Stops</h2>
          <button 
            onClick={() => setShowAddStop(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Stop</span>
          </button>
        </div>

        {/* Stops List */}
        {stops.length > 0 ? (
          <div className="space-y-4">
            {stops.map((stop, index) => (
              <div key={stop.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{stop.cityName}</h3>
                    <p className="text-slate-400 text-sm">{stop.country}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-400 text-sm">
                    {format(new Date(stop.arrivalDate), 'MMM dd')} - {format(new Date(stop.departureDate), 'MMM dd')}
                  </span>
                  <button
                    onClick={() => handleRemoveStop(stop.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State for Itinerary */
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No stops yet</h3>
            <p className="text-slate-400 mb-6">Start building your itinerary by adding destinations</p>
            <button 
              onClick={() => setShowAddStop(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Your First Stop</span>
            </button>
          </div>
        )}
      </div>

      {/* Add Stop Modal */}
      {showAddStop && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Add Stop</h3>
              <button
                onClick={() => {
                  setShowAddStop(false);
                  setSelectedCity(null);
                  setSearchQuery('');
                }}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Search Destination</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search cities or countries..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {searchQuery && (
                <div className="max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {filteredCities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => setSelectedCity(city)}
                        className={`w-full p-3 text-left rounded-lg transition-colors ${
                          selectedCity?.id === city.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-700/50 text-white hover:bg-slate-700'
                        }`}
                      >
                        <div className="font-medium">{city.name}</div>
                        <div className="text-sm opacity-75">{city.country}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedCity && (
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <h4 className="text-white font-medium mb-2">Selected Destination</h4>
                  <p className="text-white">{selectedCity.name}, {selectedCity.country}</p>
                </div>
              )}

              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={handleAddStop}
                  disabled={!selectedCity}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Add Stop
                </button>
                <button
                  onClick={() => {
                    setShowAddStop(false);
                    setSelectedCity(null);
                    setSearchQuery('');
                  }}
                  className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryBuilder;