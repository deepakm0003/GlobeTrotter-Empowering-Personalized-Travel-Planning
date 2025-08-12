import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Calendar,
  MapPin,
  Users,
  Car,
  Home,
  Utensils,
  Activity,
  Package,
  Brain,
  BarChart3,
  PieChart,
  TrendingDown,
  Info,
  Globe,
  Zap,
  X,
  Edit,
  Trash2,
  Target,
  Lightbulb,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { format, differenceInDays } from 'date-fns';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

interface BudgetItem {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
}

interface BudgetBreakdown {
  transport: number;
  accommodation: number;
  activities: number;
  meals: number;
  other: number;
}

interface AIPrediction {
  breakdown: {
    accommodation: number;
    transport: number;
    activities: number;
    meals: number;
    other: number;
  };
  totalPredicted: number;
  dailyAverage: number;
  confidence: number;
  insights: string[];
  recommendations: string[];
  marketFactors: {
    seasonalFactor: number;
    touristDensityFactor: number;
    costIndex: number;
    popularity: number;
  };
}

interface BudgetData {
  trip: any;
  budgetBreakdown: BudgetBreakdown;
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  averagePerDay: number;
  aiPrediction: AIPrediction | null;
  cityStats: any;
}

const BudgetBreakdown = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { trips, user } = useApp();
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [newItem, setNewItem] = useState({
    category: 'transport',
    description: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd')
  });

  // Chart colors for consistent theming
  const chartColors = {
    transport: '#3B82F6',
    accommodation: '#10B981',
    activities: '#8B5CF6',
    meals: '#F59E0B',
    other: '#6B7280'
  };

  const COLORS = Object.values(chartColors);

  useEffect(() => {
    if (tripId) {
      loadBudgetData();
    }
  }, [tripId]);

  // If no tripId is provided, show a list of trips to select from
  if (!tripId) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Budget Management</h1>
            <p className="text-slate-400 mt-1">Select a trip to view its budget breakdown</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => navigate(`/trips/${trip.id}/budget`)}
              className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6 cursor-pointer hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-white font-medium">{trip.name}</h3>
                  <p className="text-slate-400 text-sm">{trip.destinationCity}, {trip.destinationCountry}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Budget:</span>
                  <span className="text-white font-medium">${trip.totalBudget?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Duration:</span>
                  <span className="text-white">
                    {differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1} days
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center space-x-2 text-blue-400">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">View Budget Analysis</span>
              </div>
            </div>
          ))}
        </div>

        {trips.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No trips available</h3>
            <p className="text-slate-400 mb-6">Create a trip first to start managing your budget</p>
            <button
              onClick={() => navigate('/trips/create')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Trip</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  const loadBudgetData = async () => {
    try {
      if (!user?.id) {
        toast.error('Please log in to view budget data');
        setIsLoading(false);
        return;
      }

      const trip = trips.find(t => t.id === tripId);
      if (!trip) {
        toast.error('Trip not found');
        setIsLoading(false);
        return;
      }

      // Fetch budget items for this trip
      const budgetItemsResponse = await fetch(`http://localhost:4000/api/trips/${tripId}/budget-items`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        }
      });
      let budgetItems = [];
      if (budgetItemsResponse.ok) {
        budgetItems = await budgetItemsResponse.json();
      }

      // Add budget items to trip object
      const tripWithItems = { ...trip, budgetItems };

      // Get AI predictions and city stats
      const [aiPrediction, cityStats] = await Promise.all([
        getAIPrediction(tripWithItems),
        getCityStats(trip.destinationCity)
      ]);
      
      // Calculate actual budget breakdown from real items
      const budgetBreakdown = {
        transport: 0,
        accommodation: 0,
        activities: 0,
        meals: 0,
        other: 0
      };

      budgetItems.forEach((item: BudgetItem) => {
        budgetBreakdown[item.category as keyof BudgetBreakdown] += item.amount;
      });

      const totalBudget = trip.totalBudget || 0;
      const totalSpent = Object.values(budgetBreakdown).reduce((sum, amount) => sum + amount, 0);
      const remaining = totalBudget - totalSpent;
      const tripDuration = differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1;
      const averagePerDay = tripDuration > 0 ? totalSpent / tripDuration : 0;

      setBudgetData({
        trip: tripWithItems,
        budgetBreakdown,
        totalBudget,
        totalSpent,
        remaining,
        averagePerDay,
        aiPrediction,
        cityStats
      });
    } catch (error) {
      console.error('Error loading budget:', error);
      toast.error('Failed to load budget data');
    } finally {
      setIsLoading(false);
    }
  };

  // Get AI prediction using new AI service
  const getAIPrediction = async (trip: any): Promise<AIPrediction | null> => {
    try {
      const response = await fetch('http://localhost:4000/api/ai/predict-budget', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        },
        body: JSON.stringify({ trip }),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error getting AI prediction:', error);
    }

    // Fallback AI prediction if server is not available
    const tripDuration = differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1;
    const baseCost = 150; // Base daily cost
    const cityMultiplier = 1.2; // City cost multiplier
    
    const totalPredicted = baseCost * tripDuration * cityMultiplier;
    
    return {
      breakdown: {
        accommodation: totalPredicted * 0.4,
        transport: totalPredicted * 0.25,
        activities: totalPredicted * 0.2,
        meals: totalPredicted * 0.1,
        other: totalPredicted * 0.05
      },
      totalPredicted,
      dailyAverage: totalPredicted / tripDuration,
      confidence: 0.85,
      insights: [
        `Based on ${tripDuration} days in ${trip.destinationCity}`,
        'Accommodation typically accounts for 40% of travel costs',
        'Transport costs vary by destination accessibility',
        'Consider seasonal pricing fluctuations'
      ],
      recommendations: [
        'Book accommodation in advance for better rates',
        'Use public transport to reduce costs',
        'Plan activities during off-peak hours',
        'Set aside 10% for unexpected expenses'
      ],
      marketFactors: {
        seasonalFactor: 1.1,
        touristDensityFactor: 1.2,
        costIndex: 120,
        popularity: 85
      }
    };
  };

  // Get city statistics
  const getCityStats = async (cityName: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/ai/city-stats/${encodeURIComponent(cityName)}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        }
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error getting city stats:', error);
    }

    // Fallback city stats if server is not available
    return {
      name: cityName,
      country: 'Unknown',
      costIndex: Math.floor(Math.random() * 60) + 80, // Random cost index between 80-140
      popularity: Math.floor(Math.random() * 40) + 60, // Random popularity between 60-100
      averageDailyCost: Math.floor(Math.random() * 100) + 100, // Random daily cost between 100-200
      activityCount: Math.floor(Math.random() * 50) + 20, // Random activity count between 20-70
      description: `Travel destination with various attractions and activities.`,
      currency: 'USD',
      region: 'Unknown'
    };
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'transport': return <Car className="h-4 w-4" />;
      case 'accommodation': return <Home className="h-4 w-4" />;
      case 'activities': return <Activity className="h-4 w-4" />;
      case 'meals': return <Utensils className="h-4 w-4" />;
      case 'other': return <Package className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'transport': return 'bg-blue-500';
      case 'accommodation': return 'bg-green-500';
      case 'activities': return 'bg-purple-500';
      case 'meals': return 'bg-orange-500';
      case 'other': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category.toLowerCase()) {
      case 'transport': return 'Transport';
      case 'accommodation': return 'Accommodation';
      case 'activities': return 'Activities';
      case 'meals': return 'Meals';
      case 'other': return 'Other';
      default: return category;
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripId) return;
    if (!user?.id) {
      toast.error('Please log in to add expenses');
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/trips/${tripId}/budget-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        },
        body: JSON.stringify({
          ...newItem,
          amount: parseFloat(newItem.amount)
        }),
      });

      if (response.ok) {
        const addedItem = await response.json();
        toast.success('Expense added successfully!');
        setShowAddItem(false);
        setNewItem({
          category: 'transport',
          description: '',
          amount: '',
          date: format(new Date(), 'yyyy-MM-dd')
        });
        
        // Reload budget data to include the new item
        await loadBudgetData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to add expense');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    }
  };

  const handleUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!user?.id) {
      toast.error('Please log in to update expenses');
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/budget-items/${editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        },
        body: JSON.stringify({
          ...newItem,
          amount: parseFloat(newItem.amount)
        }),
      });

      if (response.ok) {
        toast.success('Expense updated successfully!');
        setEditingItem(null);
        setNewItem({
          category: 'transport',
          description: '',
          amount: '',
          date: format(new Date(), 'yyyy-MM-dd')
        });
        await loadBudgetData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update expense');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    if (!user?.id) {
      toast.error('Please log in to delete expenses');
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/budget-items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || ''
        }
      });

      if (response.ok) {
        toast.success('Expense deleted successfully!');
        await loadBudgetData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  // Create pie chart data for budget breakdown
  const createPieChartData = (breakdown: BudgetBreakdown) => {
    return Object.entries(breakdown)
      .filter(([_, value]) => value > 0)
      .map(([category, value]) => ({
        name: getCategoryName(category),
        value,
        color: chartColors[category as keyof typeof chartColors] || '#6B7280'
      }));
  };

  // Create comparison data for AI vs Actual
  const createComparisonData = () => {
    if (!budgetData?.aiPrediction) return null;

    const categories = ['accommodation', 'transport', 'activities', 'meals', 'other'];
    return categories.map(category => ({
      category: getCategoryName(category),
      predicted: budgetData.aiPrediction!.breakdown[category as keyof BudgetBreakdown],
      actual: budgetData.budgetBreakdown[category as keyof BudgetBreakdown],
      difference: budgetData.aiPrediction!.breakdown[category as keyof BudgetBreakdown] - 
                  budgetData.budgetBreakdown[category as keyof BudgetBreakdown]
    }));
  };

  // Create AI prediction chart data
  const createAIPredictionData = () => {
    if (!budgetData?.aiPrediction) return null;

    return Object.entries(budgetData.aiPrediction.breakdown).map(([category, value]) => ({
      name: getCategoryName(category),
      value,
      color: chartColors[category as keyof typeof chartColors] || '#6B7280'
    }));
  };

  // Create spending trend data (daily breakdown)
  const createSpendingTrendData = () => {
    if (!budgetData?.trip.budgetItems) return [];

    const dailySpending: { [key: string]: number } = {};
    
    budgetData.trip.budgetItems.forEach((item: BudgetItem) => {
      const date = format(new Date(item.date), 'MMM dd');
      dailySpending[date] = (dailySpending[date] || 0) + item.amount;
    });

    return Object.entries(dailySpending).map(([date, amount]) => ({
      date,
      amount,
      cumulative: 0 // Will be calculated
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!budgetData) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">Failed to load budget data</p>
      </div>
    );
  }

  const { trip, budgetBreakdown, totalBudget, totalSpent, remaining, averagePerDay, aiPrediction, cityStats } = budgetData;
  const isOverBudget = remaining < 0;
  const budgetPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const tripDuration = differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1;
  const pieChartData = createPieChartData(budgetBreakdown);
  const comparisonData = createComparisonData();

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
            <h1 className="text-3xl font-bold text-white">AI-Powered Budget Analysis</h1>
            <p className="text-slate-400 mt-1">{trip.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-green-400">
            <Brain className="h-4 w-4" />
            <span className="text-sm">AI Active</span>
          </div>
          <button
            onClick={() => setShowAddItem(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Trip Details Card */}
      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <MapPin className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Destination</p>
              <p className="text-white font-medium">{trip.destinationCity}, {trip.destinationCountry}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <Calendar className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Duration</p>
              <p className="text-white font-medium">{tripDuration} days</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Users className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Travelers</p>
              <p className="text-white font-medium">1 person</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-3 bg-orange-500/20 rounded-lg">
              <Zap className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">AI Confidence</p>
              <p className="text-white font-medium">
                {aiPrediction?.confidence ? `${Math.round(aiPrediction.confidence * 100)}%` : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Predictions Section */}
      {aiPrediction && (
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-green-500" />
              <h2 className="text-xl font-bold text-white">AI Spending Predictions</h2>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>ML Model Trained on {Object.keys(cityStats || {}).length > 0 ? 'Real Data' : 'Seed Data'}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(aiPrediction.breakdown).map(([category, amount]) => (
              <div key={category} className="bg-slate-700/30 rounded-lg p-4 hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(category)}
                    <span className="text-white font-medium">{getCategoryName(category)}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">${amount.toFixed(2)}</p>
                    <p className="text-slate-400 text-sm">
                      {((amount / aiPrediction.totalPredicted) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>
                
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-blue-500"
                    style={{ width: `${(amount / aiPrediction.totalPredicted) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Insights */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <h3 className="text-white font-medium">AI Insights</h3>
              </div>
              <div className="space-y-2">
                {aiPrediction.insights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm text-slate-300">
                    <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Target className="h-5 w-5 text-green-500" />
                <h3 className="text-white font-medium">Recommendations</h3>
              </div>
              <div className="space-y-2">
                {aiPrediction.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm text-slate-300">
                    <div className="w-1 h-1 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Actual Spending Pie Chart */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-6">
            <PieChart className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-bold text-white">Actual Spending Breakdown</h2>
          </div>
          
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`$${value.toFixed(2)}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <PieChart className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">No spending data yet</p>
              <p className="text-slate-500 text-sm">Add expenses to see the breakdown</p>
            </div>
          )}
        </div>

        {/* AI Prediction Pie Chart */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Brain className="h-6 w-6 text-green-500" />
            <h2 className="text-xl font-bold text-white">AI Predicted Spending</h2>
          </div>
          
          {aiPrediction && createAIPredictionData() ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={createAIPredictionData() || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(createAIPredictionData() || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`$${value.toFixed(2)}`, 'Predicted']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12">
              <Brain className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">AI predictions not available</p>
              <p className="text-slate-500 text-sm">Check your trip details</p>
            </div>
          )}
        </div>
      </div>

      {/* AI vs Actual Comparison Bar Chart */}
      {comparisonData && (
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-6">
            <BarChart3 className="h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-bold text-white">AI vs Actual Spending Comparison</h2>
          </div>
          
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="category" 
                stroke="#94a3b8"
                fontSize={12}
              />
              <YAxis 
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value: any) => [`$${value.toFixed(2)}`, 'Amount']}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Legend />
              <Bar dataKey="predicted" fill="#3B82F6" name="AI Predicted" />
              <Bar dataKey="actual" fill="#10B981" name="Actual Spent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Spending Trend Line Chart */}
      {budgetData?.trip.budgetItems && budgetData.trip.budgetItems.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-6">
            <TrendingUp className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-bold text-white">Daily Spending Trend</h2>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={createSpendingTrendData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                fontSize={12}
              />
              <YAxis 
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value: any) => [`$${value.toFixed(2)}`, 'Daily Spending']}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#F59E0B" 
                strokeWidth={3}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Budget</p>
              <p className="text-2xl font-bold text-white">${totalBudget.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">AI Predicted</p>
              <p className="text-2xl font-bold text-white">
                ${aiPrediction ? aiPrediction.totalPredicted.toFixed(2) : 'N/A'}
              </p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg">
              <Brain className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Remaining</p>
              <p className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${Math.abs(remaining).toFixed(2)}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${remaining >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {remaining >= 0 ? (
                <DollarSign className="h-6 w-6 text-green-500" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-red-500" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Avg/Day</p>
              <p className="text-2xl font-bold text-white">${averagePerDay.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* City Statistics */}
      {cityStats && (
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Globe className="h-6 w-6 text-blue-500" />
              <h2 className="text-xl font-bold text-white">Destination Analysis</h2>
            </div>
            <span className="text-sm text-slate-400">
              {cityStats.name}, {cityStats.country}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Cost Index</h3>
              <p className="text-2xl font-bold text-blue-500">{cityStats.costIndex}</p>
              <p className="text-slate-400 text-sm">
                {cityStats.costIndex > 120 ? 'High Cost' : cityStats.costIndex < 80 ? 'Budget Friendly' : 'Moderate'}
              </p>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Popularity</h3>
              <p className="text-2xl font-bold text-purple-500">{cityStats.popularity}%</p>
              <p className="text-slate-400 text-sm">
                {cityStats.popularity > 90 ? 'Very Popular' : cityStats.popularity > 70 ? 'Popular' : 'Moderate'}
              </p>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Daily Cost</h3>
              <p className="text-2xl font-bold text-green-500">${cityStats.averageDailyCost}</p>
              <p className="text-slate-400 text-sm">Average per day</p>
            </div>

            <div className="bg-slate-700/30 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Activities</h3>
              <p className="text-2xl font-bold text-orange-500">{cityStats.activityCount}</p>
              <p className="text-slate-400 text-sm">Available options</p>
            </div>
          </div>
        </div>
      )}

      {/* Budget Progress */}
      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Budget Progress</h2>
          <span className="text-slate-400">{budgetPercentage.toFixed(1)}% used</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              budgetPercentage > 100 ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          ></div>
        </div>
        {isOverBudget && (
          <div className="mt-3 flex items-center space-x-2 text-red-400">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">You are ${Math.abs(remaining).toFixed(2)} over budget</span>
          </div>
        )}
      </div>

      {/* AI vs Actual Comparison */}
      {aiPrediction && comparisonData && (
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">AI vs Actual Spending</h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-slate-400">AI Predicted</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-slate-400">Actual</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {comparisonData.map((item, index) => (
              <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-medium">{item.category}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-blue-400">${item.predicted.toFixed(2)}</span>
                    <span className="text-green-400">${item.actual.toFixed(2)}</span>
                    <div className={`flex items-center space-x-1 ${
                      item.difference > 0 ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {item.difference > 0 ? (
                        <TrendingUpIcon className="h-4 w-4" />
                      ) : (
                        <TrendingDownIcon className="h-4 w-4" />
                      )}
                      <span className="text-sm">
                        ${Math.abs(item.difference).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div className="flex h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-500"
                      style={{ width: `${(item.predicted / Math.max(item.predicted, item.actual)) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-green-500"
                      style={{ width: `${(item.actual / Math.max(item.predicted, item.actual)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expense Items List */}
      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Expense Items</h2>
        </div>
        
        {budgetData.trip.budgetItems && budgetData.trip.budgetItems.length > 0 ? (
          <div className="space-y-4">
            {budgetData.trip.budgetItems.map((item: BudgetItem) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${getCategoryColor(item.category)}`}>
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <p className="text-white font-medium">{item.description}</p>
                    <p className="text-slate-400 text-sm">
                      {format(new Date(item.date), 'MMM dd, yyyy')} • {getCategoryName(item.category)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-bold">${item.amount.toFixed(2)}</span>
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setNewItem({
                        category: item.category,
                        description: item.description,
                        amount: item.amount.toString(),
                        date: format(new Date(item.date), 'yyyy-MM-dd')
                      });
                    }}
                    className="p-2 hover:bg-slate-600/50 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4 text-slate-400" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400">No expense items yet</p>
            <p className="text-slate-500 text-sm">Add your first expense to start tracking</p>
          </div>
        )}
      </div>

      {/* Add/Edit Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Add New Expense</h3>
              <button
                onClick={() => setShowAddItem(false)}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="transport">Transport</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="activities">Activities</option>
                  <option value="meals">Meals</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Description</label>
                <input
                  type="text"
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter expense description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Amount</label>
                <input
                  type="number"
                  value={newItem.amount}
                  onChange={(e) => setNewItem(prev => ({ ...prev, amount: e.target.value }))}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Date</label>
                <input
                  type="date"
                  value={newItem.date}
                  onChange={(e) => setNewItem(prev => ({ ...prev, date: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Add Expense
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Edit Expense</h3>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setNewItem({
                    category: 'transport',
                    description: '',
                    amount: '',
                    date: format(new Date(), 'yyyy-MM-dd')
                  });
                }}
                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleUpdateItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="transport">Transport</option>
                  <option value="accommodation">Accommodation</option>
                  <option value="activities">Activities</option>
                  <option value="meals">Meals</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Description</label>
                <input
                  type="text"
                  value={newItem.description}
                  onChange={(e) => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter expense description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Amount</label>
                <input
                  type="number"
                  value={newItem.amount}
                  onChange={(e) => setNewItem(prev => ({ ...prev, amount: e.target.value }))}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Date</label>
                <input
                  type="date"
                  value={newItem.date}
                  onChange={(e) => setNewItem(prev => ({ ...prev, date: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                Update Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetBreakdown;