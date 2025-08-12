import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Share2, 
  Mail, 
  Link, 
  Copy, 
  Check, 
  ArrowLeft, 
  Users, 
  Calendar, 
  MapPin, 
  DollarSign,
  Send,
  Loader2,
  Eye,
  Download,
  Printer
} from 'lucide-react';
import { Trip } from '../../types';
import { format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';
import { useApp } from '../../context/AppContext';

interface ShareData {
  tripId: string;
  shareMethod: 'link' | 'email';
  recipientEmail?: string;
  shareUrl?: string;
  sharedTripId?: string;
}

const ShareTripPage: React.FC = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareMethod, setShareMethod] = useState<'link' | 'email'>('link');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTrip();
    } else {
      setIsLoading(false);
      setError('Please log in to share trips');
    }
  }, [user, tripId]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && !isLoading) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  const fetchTrip = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required. Please log in.');
        setIsLoading(false);
        return;
      }

      const response = await fetch(`/api/trips/${tripId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const tripData = await response.json();
        setTrip(tripData);
      } else if (response.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (response.status === 404) {
        setError('Trip not found.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to load trip');
      }
    } catch (error) {
      console.error('Error fetching trip:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareLink = async () => {
    if (!trip) return;

    try {
      setIsSharing(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`/api/trips/${trip.id}/share-link`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setShareData({
          tripId: trip.id,
          shareMethod: 'link',
          shareUrl: data.shareUrl,
          sharedTripId: data.sharedTripId
        });
        toast.success('Share link generated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to generate share link');
      }
    } catch (error) {
      console.error('Error sharing link:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleShareEmail = async () => {
    if (!trip || !recipientEmail.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setIsSharing(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Authentication required. Please log in.');
        setIsSharing(false);
        return;
      }
      
      const response = await fetch('/api/trips/share-email-simple', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tripId: trip.id,
          recipientEmail: recipientEmail.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setShareData({
          tripId: trip.id,
          shareMethod: 'email',
          recipientEmail: recipientEmail.trim(),
          shareUrl: data.shareUrl,
          sharedTripId: data.sharedTripId
        });
        
        if (data.emailSent) {
          toast.success(`Trip shared successfully with ${recipientEmail}!`);
        } else {
          toast.success('Trip made public! Email failed but share link is available.');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to share trip via email');
      }
    } catch (error) {
      console.error('Error sharing email:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const copyShareUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Share link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const viewSharedTrip = (url: string) => {
    window.open(url, '_blank');
  };

  const downloadPDF = () => {
    if (!trip) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to download PDF');
      return;
    }

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
            @media print {
              body { 
                margin: 20px; 
                font-size: 12px;
              }
              .trip-image {
                max-width: 300px;
                max-height: 200px;
              }
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
                <th>Destination</th>
                <td>${trip.destinationCity}, ${trip.destinationCountry}</td>
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
                <th>Duration</th>
                <td>${differenceInDays(new Date(trip.endDate), new Date(trip.startDate))} days</td>
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
          <p className="text-white">Loading trip...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-slate-400 mb-6">{error || 'Trip not found'}</p>
          <button
            onClick={() => navigate('/trips')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Go to My Trips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/trips')}
              className="p-2 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">Share Trip</h1>
              <p className="text-slate-400">Share your itinerary with friends and family</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Trip Preview */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Trip Preview</h2>
              
              {trip.coverPhoto && (
                <div className="mb-4">
                  <img
                    src={trip.coverPhoto}
                    alt={trip.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}

              <h3 className="text-lg font-semibold text-white mb-3">{trip.name}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-green-400" />
                  <div>
                    <p className="text-slate-400 text-sm">Destination</p>
                    <p className="text-white font-medium">{trip.destinationCity}, {trip.destinationCountry}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-blue-400" />
                  <div>
                    <p className="text-slate-400 text-sm">Duration</p>
                    <p className="text-white font-medium">{differenceInDays(new Date(trip.endDate), new Date(trip.startDate))} days</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="text-slate-400 text-sm">Budget</p>
                    <p className="text-white font-medium">${trip.estimatedCost?.toFixed(2) || '0.00'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="h-5 w-5 text-purple-400" />
                  <div>
                    <p className="text-slate-400 text-sm">Dates</p>
                    <p className="text-white font-medium">
                      {format(new Date(trip.startDate), 'MMM dd')} - {format(new Date(trip.endDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              </div>

              {trip.description && (
                <div className="mb-4">
                  <p className="text-slate-400 text-sm">{trip.description}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigate(`/trips/${trip.id}`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Trip</span>
                </button>
                <button
                  onClick={downloadPDF}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sharing Options */}
          <div className="space-y-6">
            {/* Share Method Selection */}
            <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Share Method</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setShareMethod('link')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 ${
                    shareMethod === 'link'
                      ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                      : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <Link className="h-6 w-6" />
                  <div className="text-left">
                    <p className="font-medium">Share Link</p>
                    <p className="text-sm opacity-75">Generate a public link</p>
                  </div>
                </button>
                
                <button
                  onClick={() => setShareMethod('email')}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 ${
                    shareMethod === 'email'
                      ? 'border-green-500 bg-green-500/20 text-green-400'
                      : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <Mail className="h-6 w-6" />
                  <div className="text-left">
                    <p className="font-medium">Send Email</p>
                    <p className="text-sm opacity-75">Share via email</p>
                  </div>
                </button>
              </div>

              {/* Email Input */}
              {shareMethod === 'email' && (
                <div className="mb-6">
                  <label className="block text-white font-medium mb-2">Recipient Email</label>
                  <input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="Enter recipient's email address"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              )}

              {/* Share Button */}
              <button
                onClick={shareMethod === 'link' ? handleShareLink : handleShareEmail}
                disabled={isSharing || (shareMethod === 'email' && !recipientEmail.trim())}
                className={`w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  isSharing
                    ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                    : shareMethod === 'link'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isSharing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Sharing...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>
                      {shareMethod === 'link' ? 'Generate Share Link' : 'Send Email'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Share Results */}
            {shareData && (
              <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">Share Results</h2>
                
                <div className="space-y-4">
                  {/* Share Method Info */}
                  <div className="flex items-center space-x-3">
                    {shareData.shareMethod === 'email' ? (
                      <Mail className="h-5 w-5 text-green-400" />
                    ) : (
                      <Link className="h-5 w-5 text-blue-400" />
                    )}
                    <div>
                      <p className="text-white font-medium">
                        {shareData.shareMethod === 'email' ? 'Email Share' : 'Link Share'}
                      </p>
                      {shareData.shareMethod === 'email' && shareData.recipientEmail && (
                        <p className="text-slate-400 text-sm">Sent to: {shareData.recipientEmail}</p>
                      )}
                    </div>
                  </div>

                  {/* Share URL */}
                  {shareData.shareUrl && (
                    <div className="space-y-3">
                      <label className="block text-white font-medium">Share URL</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={shareData.shareUrl}
                          readOnly
                          className="flex-1 px-3 py-2 bg-slate-700/30 border border-slate-600/50 rounded-lg text-white text-sm font-mono"
                        />
                        <button
                          onClick={() => copyShareUrl(shareData.shareUrl!)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                          title="Copy link"
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => viewSharedTrip(shareData.shareUrl!)}
                          className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                          title="View shared trip"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Success Message */}
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Check className="h-5 w-5 text-green-400" />
                      <p className="text-green-400 font-medium">
                        {shareData.shareMethod === 'email' 
                          ? 'Trip shared successfully via email!' 
                          : 'Share link generated successfully!'
                        }
                      </p>
                    </div>
                    <p className="text-green-300 text-sm mt-1">
                      The trip has been saved and is now publicly accessible.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Actions */}
            <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Additional Actions</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/shared-trips')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Users className="h-5 w-5" />
                  <span>View All Shared Trips</span>
                </button>
                
                <button
                  onClick={() => navigate(`/trips/${trip.id}/edit`)}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Share2 className="h-5 w-5" />
                  <span>Edit Trip</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareTripPage;
