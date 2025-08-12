import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, Users, Share2, Download, Printer, ArrowLeft, Clock, Star } from 'lucide-react';
import { Trip } from '../../types';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';

const SharedItinerary: React.FC = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedTrip = async () => {
      try {
        const response = await fetch(`/api/trips/shared/${tripId}`);
        if (response.ok) {
          const tripData = await response.json();
          setTrip(tripData);
        } else {
          setError('Trip not found or not publicly shared');
        }
      } catch (error) {
        setError('Failed to load trip');
      } finally {
        setIsLoading(false);
      }
    };

    if (tripId) {
      fetchSharedTrip();
    }
  }, [tripId]);

  const downloadPDF = () => {
    if (!trip) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to download PDF');
      return;
    }

    // Same PDF generation logic as ItineraryBuilder
    const pdfContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${trip.name} - Shared Itinerary</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 40px;
              color: #333;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #3b82f6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .trip-image {
              max-width: 400px;
              max-height: 250px;
              width: 100%;
              height: auto;
              object-fit: cover;
              border-radius: 12px;
              margin: 20px auto;
              display: block;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
              border: 2px solid #e5e7eb;
            }
            .trip-info {
              margin-bottom: 30px;
            }
            .trip-info table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .trip-info th, .trip-info td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #ddd;
            }
            .trip-info th {
              background-color: #f8f9fa;
              font-weight: bold;
              color: #374151;
              width: 30%;
            }
            .trip-info td {
              color: #1f2937;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #6b7280;
              font-size: 12px;
              border-top: 1px solid #e5e7eb;
              padding-top: 20px;
            }
            .no-stops {
              text-align: center;
              color: #6b7280;
              font-style: italic;
              padding: 40px;
              background-color: #f9fafb;
              border-radius: 8px;
            }
            @media print {
              body { 
                margin: 20px; 
                font-size: 12px;
              }
              .trip-image {
                max-width: 300px;
                max-height: 200px;
              }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="color: #1f2937; margin-bottom: 10px;">${trip.name}</h1>
            <h2 style="color: #3b82f6; margin-bottom: 20px;">Shared Trip Itinerary</h2>
            ${trip.coverPhoto ? `<img src="${trip.coverPhoto}" alt="${trip.name}" class="trip-image">` : ''}
            <p style="color: #6b7280; margin-top: 15px;">Shared on ${format(new Date(), 'MMMM dd, yyyy')}</p>
          </div>

          <div class="trip-info">
            <h3 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">Trip Details</h3>
            <table>
              <tr>
                <th>Trip Name</th>
                <td>${trip.name}</td>
              </tr>
              <tr>
                <th>Starting Place</th>
                <td>${trip.destinationCity}</td>
              </tr>
              <tr>
                <th>Ending Place</th>
                <td>${trip.destinationCountry}</td>
              </tr>
              <tr>
                <th>Start Date</th>
                <td>${format(new Date(trip.startDate), 'MMMM dd, yyyy')}</td>
              </tr>
              <tr>
                <th>End Date</th>
                <td>${format(new Date(trip.endDate), 'MMMM dd, yyyy')}</td>
              </tr>
              <tr>
                <th>Total Budget</th>
                <td>$${trip.totalBudget?.toFixed(2) || '0.00'}</td>
              </tr>
              <tr>
                <th>Estimated Cost</th>
                <td>$${trip.estimatedCost?.toFixed(2) || '0.00'}</td>
              </tr>
              ${trip.description ? `
                <tr>
                  <th>Description</th>
                  <td>${trip.description}</td>
                </tr>
              ` : ''}
            </table>
          </div>

          <div class="footer">
            <p>Shared via GlobeTrotter - Plan. Explore. Experience.</p>
            <p>${trip.name} • ${format(new Date(trip.startDate), 'MMM dd')} - ${format(new Date(trip.endDate), 'MMM dd, yyyy')}</p>
          </div>

          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 1000);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(pdfContent);
    printWindow.document.close();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading shared itinerary...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Trip Not Found</h1>
          <p className="text-slate-400 mb-6">{error || 'This trip is not available for public viewing.'}</p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{trip.name}</h1>
          <p className="text-slate-400">Shared Trip Itinerary</p>
        </div>

        {/* Trip Card */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6 mb-8">
          {trip.coverPhoto && (
            <div className="mb-6">
              <img
                src={trip.coverPhoto}
                alt={trip.name}
                className="w-full h-48 md:h-64 object-cover rounded-lg"
              />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-slate-400 text-sm">Duration</p>
                <p className="text-white font-medium">{differenceInDays(new Date(trip.endDate), new Date(trip.startDate))} days</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-slate-400 text-sm">Destination</p>
                <p className="text-white font-medium">{trip.destinationCity}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <DollarSign className="h-5 w-5 text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-slate-400 text-sm">Budget</p>
                <p className="text-white font-medium">${trip.estimatedCost?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-purple-400 flex-shrink-0" />
              <div>
                <p className="text-slate-400 text-sm">Country</p>
                <p className="text-white font-medium">{trip.destinationCountry}</p>
              </div>
            </div>
          </div>

          {trip.description && (
            <div className="mb-6">
              <h3 className="text-white font-medium mb-2">Description</h3>
              <p className="text-slate-400">{trip.description}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              onClick={downloadPDF}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button>
            <button
              onClick={() => {
                const shareUrl = window.location.href;
                navigator.clipboard.writeText(shareUrl);
                toast.success('Share link copied to clipboard!');
              }}
              className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <Share2 className="h-4 w-4" />
              <span>Copy Link</span>
            </button>
          </div>
        </div>

        {/* Trip Details */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Trip Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-2 flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  <span>Dates</span>
                </h3>
                <p className="text-slate-400">
                  {format(new Date(trip.startDate), 'MMM dd, yyyy')} - {format(new Date(trip.endDate), 'MMM dd, yyyy')}
                </p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2 flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-green-400" />
                  <span>Location</span>
                </h3>
                <p className="text-slate-400">{trip.destinationCity}, {trip.destinationCountry}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-2 flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-yellow-400" />
                  <span>Total Budget</span>
                </h3>
                <p className="text-slate-400">${trip.totalBudget?.toFixed(2) || '0.00'}</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-2 flex items-center space-x-2">
                  <Star className="h-4 w-4 text-purple-400" />
                  <span>Estimated Cost</span>
                </h3>
                <p className="text-slate-400">${trip.estimatedCost?.toFixed(2) || '0.00'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Itinerary Stops */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-6">Itinerary Stops</h2>
          {/* The stops are now part of the trip object, but not directly displayed here */}
          {/* If you need to display stops, you'd iterate over trip.stops */}
          {/* For now, we'll show a message if no stops are explicitly linked */}
          {trip.stops && trip.stops.length > 0 ? (
            <div className="space-y-4">
              {trip.stops.map((stop, index) => (
                <div key={stop.id} className="flex items-center space-x-4 p-4 bg-slate-700/30 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">{stop.cityName}</h3>
                    <p className="text-slate-400 text-sm">{stop.country}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-slate-400 text-sm">
                      {format(new Date(stop.arrivalDate), 'MMM dd')} - {format(new Date(stop.departureDate), 'MMM dd')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="h-16 w-16 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-slate-500" />
              </div>
              <p className="text-slate-400">No stops planned yet</p>
              <p className="text-slate-500 text-sm mt-2">The trip itinerary is still being planned</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm">
            Shared via GlobeTrotter - Plan. Explore. Experience.
          </p>
          <p className="text-slate-600 text-xs mt-1">
            {trip.name} • {format(new Date(trip.startDate), 'MMM dd')} - {format(new Date(trip.endDate), 'MMM dd, yyyy')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharedItinerary;