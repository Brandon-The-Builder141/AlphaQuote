/**
 * Analytics & Insights Dashboard
 *
 * Provides comprehensive reporting and analytics for AlphaQuote:
 * - Project profitability tracking (estimated vs actual costs)
 * - Vendor performance analysis (best prices over time)
 * - Material usage trends
 * - Revenue and cost analytics
 * - Read-only dashboard with charts and tables
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  Users,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  PieChart,
  LineChart,
  Building,
  Receipt,
  Target
} from 'lucide-react';
import { API_BASE_URL } from '../config/env';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    projectProfitability: [],
    vendorPerformance: [],
    materialTrends: [],
    revenueData: [],
    costBreakdown: [],
    summaryStats: {}
  });
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [selectedVendor, setSelectedVendor] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod, selectedVendor, selectedCategory]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        period: selectedPeriod,
        vendor: selectedVendor,
        category: selectedCategory
      });

      const response = await fetch(`${API_BASE_URL}/api/analytics?${params}`);
      const data = await response.json();

      if (data.success) {
        setAnalyticsData(data.analytics);
      } else {
        console.error('Failed to fetch analytics:', data.error);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-slate-300">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            Loading analytics...
          </div>
        </div>
      </div>
    );
  }

  const { summaryStats, projectProfitability, vendorPerformance, materialTrends, revenueData, costBreakdown } = analyticsData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-xl">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Analytics & Insights</h1>
              <p className="text-slate-400">Track performance, profitability, and trends</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAnalyticsData}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-all duration-200"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button
              onClick={() => {/* Export functionality */}}
              className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-xl hover:bg-primary/30 transition-all duration-200"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className="mb-8 bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-300">Filters:</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="1year">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Building className="h-4 w-4 text-slate-400" />
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Vendors</option>
              <option value="Home Depot">Home Depot</option>
              <option value="Lowe's">Lowe's</option>
              <option value="Menards">Menards</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Categories</option>
              <option value="Flooring">Flooring</option>
              <option value="Paint">Paint</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-400" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{formatCurrency(summaryStats.totalRevenue || 0)}</h3>
          <p className="text-slate-400 text-sm">Total Revenue</p>
          <p className="text-green-400 text-xs mt-1">+{summaryStats.revenueGrowth || 0}% vs last period</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Target className="h-6 w-6 text-blue-400" />
            </div>
            <TrendingUp className="h-5 w-5 text-blue-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{summaryStats.totalProjects || 0}</h3>
          <p className="text-slate-400 text-sm">Total Projects</p>
          <p className="text-blue-400 text-xs mt-1">+{summaryStats.projectGrowth || 0}% vs last period</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
            <TrendingUp className="h-5 w-5 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{summaryStats.activeVendors || 0}</h3>
          <p className="text-slate-400 text-sm">Active Vendors</p>
          <p className="text-purple-400 text-xs mt-1">{summaryStats.topVendor || 'N/A'} leads</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Package className="h-6 w-6 text-orange-400" />
            </div>
            <TrendingUp className="h-5 w-5 text-orange-400" />
          </div>
          <h3 className="text-2xl font-bold text-white">{summaryStats.materialsUsed || 0}</h3>
          <p className="text-slate-400 text-sm">Materials Used</p>
          <p className="text-orange-400 text-xs mt-1">{summaryStats.topMaterial || 'N/A'} most used</p>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Project Profitability Chart */}
        <motion.div
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Project Profitability</h3>
            </div>
            <Eye className="h-5 w-5 text-slate-400" />
          </div>

          <div className="space-y-4">
            {projectProfitability.slice(0, 5).map((project, index) => {
              const profitMargin = ((project.actualRevenue - project.actualCosts) / project.actualRevenue * 100);
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <div className="flex-1">
                    <p className="text-white font-medium">{project.name}</p>
                    <p className="text-slate-400 text-sm">{project.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold">{formatCurrency(project.actualRevenue - project.actualCosts)}</p>
                    <p className={`text-sm ${profitMargin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {profitMargin.toFixed(1)}% margin
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Vendor Performance Chart */}
        <motion.div
          className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Building className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Vendor Performance</h3>
            </div>
            <Eye className="h-5 w-5 text-slate-400" />
          </div>

          <div className="space-y-4">
            {vendorPerformance.map((vendor, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-primary"></div>
                  <div>
                    <p className="text-white font-medium">{vendor.name}</p>
                    <p className="text-slate-400 text-sm">{vendor.orderCount} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{formatCurrency(vendor.totalSpent)}</p>
                  <p className="text-green-400 text-sm">{formatCurrency(vendor.avgPricePerItem)} avg/item</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Material Trends */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <PieChart className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Material Usage Trends</h3>
            </div>
            <Eye className="h-5 w-5 text-slate-400" />
          </div>

          <div className="space-y-4">
            {materialTrends.slice(0, 6).map((material, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-yellow-500'][index % 6]
                  }`}></div>
                  <div>
                    <p className="text-white font-medium">{material.name}</p>
                    <p className="text-slate-400 text-sm">{material.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{formatNumber(material.quantityUsed)} {material.unit}</p>
                  <p className="text-purple-400 text-sm">{formatCurrency(material.totalCost)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <LineChart className="h-5 w-5 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Revenue Trends</h3>
            </div>
            <Eye className="h-5 w-5 text-slate-400" />
          </div>

          <div className="space-y-4">
            {revenueData.slice(0, 6).map((period, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">{period.period}</p>
                  <p className="text-slate-400 text-sm">{period.projectCount} projects</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{formatCurrency(period.revenue)}</p>
                  <p className={`text-sm ${period.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {period.growth >= 0 ? '+' : ''}{period.growth}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Cost Breakdown */}
      <motion.div
        className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <Receipt className="h-5 w-5 text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Cost Breakdown</h3>
          </div>
          <Eye className="h-5 w-5 text-slate-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {costBreakdown.map((category, index) => (
            <div key={index} className="p-4 bg-slate-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-medium">{category.name}</p>
                <div className={`w-3 h-3 rounded-full ${
                  ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'][index % 4]
                }`}></div>
              </div>
              <p className="text-2xl font-bold text-white">{formatCurrency(category.amount)}</p>
              <p className="text-slate-400 text-sm">{category.percentage}% of total</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
