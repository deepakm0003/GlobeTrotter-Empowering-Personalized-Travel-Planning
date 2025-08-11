import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const BudgetBreakdown: React.FC = () => {
  const { trips } = useApp();

  const budgetData = [
    { name: 'Accommodation', value: 1200, color: '#3B82F6' },
    { name: 'Transportation', value: 800, color: '#8B5CF6' },
    { name: 'Activities', value: 600, color: '#10B981' },
    { name: 'Meals', value: 500, color: '#F59E0B' },
    { name: 'Miscellaneous', value: 200, color: '#EF4444' },
  ];

  const monthlySpending = [
    { month: 'Jan', amount: 1200 },
    { month: 'Feb', amount: 800 },
    { month: 'Mar', amount: 1500 },
    { month: 'Apr', amount: 2000 },
    { month: 'May', amount: 1800 },
    { month: 'Jun', amount: 2200 },
  ];

  const totalBudget = budgetData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Budget Overview</h1>
        <p className="text-slate-400 mt-1">Track your travel expenses and stay within budget</p>
      </div>

      {/* Budget Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-full">
              +12%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white">${totalBudget.toLocaleString()}</h3>
          <p className="text-slate-400 text-sm">Total Spent</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
              On track
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white">$4,200</h3>
          <p className="text-slate-400 text-sm">Monthly Budget</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs text-orange-400 bg-orange-400/10 px-2 py-1 rounded-full">
              85%
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white">$900</h3>
          <p className="text-slate-400 text-sm">Remaining Budget</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs text-purple-400 bg-purple-400/10 px-2 py-1 rounded-full">
              3 trips
            </span>
          </div>
          <h3 className="text-2xl font-bold text-white">$1,067</h3>
          <p className="text-slate-400 text-sm">Avg per Trip</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown Pie Chart */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Expense Breakdown</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {budgetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6">
            {budgetData.map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1">
                  <p className="text-sm text-white">{item.name}</p>
                  <p className="text-xs text-slate-400">${item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Spending Trend */}
        <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Monthly Spending</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySpending}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-slate-800/50 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">Recent Expenses</h2>
        <div className="space-y-4">
          {[
            { name: 'Hotel Booking - Paris', category: 'Accommodation', amount: -320, date: '2025-01-15', status: 'completed' },
            { name: 'Flight to Tokyo', category: 'Transportation', amount: -850, date: '2025-01-14', status: 'pending' },
            { name: 'Museum Tickets', category: 'Activities', amount: -45, date: '2025-01-13', status: 'completed' },
            { name: 'Restaurant Dinner', category: 'Meals', amount: -78, date: '2025-01-12', status: 'completed' },
            { name: 'Travel Insurance', category: 'Miscellaneous', amount: -120, date: '2025-01-11', status: 'completed' },
          ].map((transaction, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 transition-all duration-200">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">{transaction.name}</p>
                  <p className="text-sm text-slate-400">{transaction.category} • {transaction.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-white">${Math.abs(transaction.amount)}</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  transaction.status === 'completed' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {transaction.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BudgetBreakdown;