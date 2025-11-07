/**
 * Job Scheduling Page
 * Main page for job scheduling and calendar management
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Plus,
  Settings,
  BarChart3,
  RefreshCw,
  MapPin,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import CalendarDashboard from '../components/CalendarDashboard';
import schedulingService from '../services/schedulingService';

const JobScheduling = () => {
  const [statistics, setStatistics] = useState({});
  const [upcomingJobs, setUpcomingJobs] = useState([]);
  const [todaysJobs, setTodaysJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // For now, use mock data to avoid API issues
      setStatistics({
        totalJobs: 0,
        inProgress: 0,
        completed: 0,
        overdue: 0
      });

      setUpcomingJobs([]);
      setTodaysJobs([]);

      // TODO: Uncomment when API is working
      // const [statsResult, upcomingResult, todayResult] = await Promise.all([
      //   schedulingService.getJobStatistics(),
      //   schedulingService.getUpcomingJobs(),
      //   schedulingService.getTodaysJobs()
      // ]);

      // if (statsResult.success) {
      //   setStatistics(statsResult.data || {});
      // }

      // if (upcomingResult.success) {
      //   setUpcomingJobs(upcomingResult.data || []);
      // }

      // if (todayResult.success) {
      //   setTodaysJobs(todayResult.data || []);
      // }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Calendar className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-4">
            Job Scheduling
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Schedule workdays, sync with your calendar, and manage your project timeline efficiently.
          </p>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Calendar className="w-8 h-8 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">Total Jobs</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {isLoading ? '...' : statistics.totalJobs || 0}
            </div>
            <div className="text-sm text-slate-400">Scheduled this month</div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-8 h-8 text-yellow-400" />
              <h3 className="text-xl font-semibold text-white">In Progress</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {isLoading ? '...' : statistics.inProgress || 0}
            </div>
            <div className="text-sm text-slate-400">Active jobs</div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <h3 className="text-xl font-semibold text-white">Completed</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {isLoading ? '...' : statistics.completed || 0}
            </div>
            <div className="text-sm text-slate-400">Finished this week</div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <h3 className="text-xl font-semibold text-white">Overdue</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {isLoading ? '...' : statistics.overdue || 0}
            </div>
            <div className="text-sm text-slate-400">Past due date</div>
          </div>
        </motion.div>

        {/* Today's Jobs */}
        {todaysJobs.length > 0 && (
          <motion.div
            className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50 shadow-lg mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-white">Today's Jobs</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todaysJobs.map(job => (
                <motion.div
                  key={job.id}
                  className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${schedulingService.getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>

                  {job.description && (
                    <p className="text-slate-400 text-sm mb-3">{job.description}</p>
                  )}

                  <div className="space-y-2 text-sm text-slate-300">
                    {job.startTime && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {schedulingService.formatTime(job.startTime)} - {schedulingService.formatTime(job.endTime)}
                      </div>
                    )}

                    {job.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Calendar Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <CalendarDashboard />
        </motion.div>

        {/* Upcoming Jobs */}
        {upcomingJobs.length > 0 && (
          <motion.div
            className="mt-8 bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-white">Upcoming Jobs</h2>
            </div>

            <div className="space-y-4">
              {upcomingJobs.slice(0, 5).map(job => (
                <motion.div
                  key={job.id}
                  className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
                  whileHover={{ y: -1 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>{schedulingService.formatDate(job.startDate)}</span>
                        {job.startTime && (
                          <span>{schedulingService.formatTime(job.startTime)} - {schedulingService.formatTime(job.endTime)}</span>
                        )}
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm ${schedulingService.getPriorityColor(job.priority)}`}>
                      {job.priority}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm ${schedulingService.getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          className="mt-8 bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-white mb-6">Quick Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.button
              className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-primary/50 transition-all duration-300 text-left"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold text-white">Schedule New Job</h3>
                <p className="text-slate-400 text-sm">Create a new scheduled job</p>
              </div>
            </motion.button>

            <motion.button
              className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-primary/50 transition-all duration-300 text-left"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold text-white">Sync Calendar</h3>
                <p className="text-slate-400 text-sm">Sync with Google Calendar or iCal</p>
              </div>
            </motion.button>

            <motion.button
              className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-primary/50 transition-all duration-300 text-left"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Settings className="w-6 h-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold text-white">Settings</h3>
                <p className="text-slate-400 text-sm">Configure scheduling preferences</p>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JobScheduling;
