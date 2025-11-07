/**
 * Calendar Dashboard Component
 * Displays scheduled jobs in calendar view with scheduling capabilities
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  CheckCircle,
  AlertCircle,
  XCircle,
  PlayCircle
} from 'lucide-react';
import schedulingService from '../services/schedulingService';

const CalendarDashboard = ({ className = '' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [scheduledJobs, setScheduledJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadScheduledJobs();
  }, [currentDate, viewMode]);

  useEffect(() => {
    applyFilters();
  }, [scheduledJobs, filters]);

  const loadScheduledJobs = async () => {
    try {
      setIsLoading(true);

      let startDate, endDate;
      const date = new Date(currentDate);

      switch (viewMode) {
        case 'day':
          startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
          break;
        case 'week':
          const dayOfWeek = date.getDay();
          startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - dayOfWeek);
          endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - dayOfWeek + 7);
          break;
        case 'month':
        default:
          startDate = new Date(date.getFullYear(), date.getMonth(), 1);
          endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
          break;
      }

      const result = await schedulingService.getJobsByDateRange(startDate, endDate);

      if (result.success) {
        setScheduledJobs(result.data || []);
      } else {
        console.error('Error loading scheduled jobs:', result.error);
        setScheduledJobs([]);
      }
    } catch (error) {
      console.error('Error loading scheduled jobs:', error);
      setScheduledJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = scheduledJobs;

    if (filters.status !== 'all') {
      filtered = filtered.filter(job => job.status === filters.status);
    }

    if (filters.priority !== 'all') {
      filtered = filtered.filter(job => job.priority === filters.priority);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower) ||
        job.location?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredJobs(filtered);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const navigateDay = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getJobsForDate = (date) => {
    if (!date) return [];

    return filteredJobs.filter(job => {
      const jobDate = new Date(job.startDate);
      return jobDate.toDateString() === date.toDateString();
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'in_progress':
        return <PlayCircle className="w-4 h-4 text-yellow-400" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-blue-400" />;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'high':
        return <AlertCircle className="w-4 h-4 text-orange-400" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-blue-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const renderMonthView = () => {
    const days = getDaysInMonth();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="grid grid-cols-7 gap-px bg-slate-700 rounded-lg overflow-hidden">
        {/* Day headers */}
        {dayNames.map(day => (
          <div key={day} className="bg-slate-800 p-2 text-center text-sm font-medium text-slate-300">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((date, index) => {
          const jobs = getJobsForDate(date);
          const isToday = date && date.toDateString() === new Date().toDateString();
          const isSelected = date && date.toDateString() === selectedDate.toDateString();

          return (
            <motion.div
              key={index}
              className={`min-h-[120px] p-2 bg-slate-900 border border-slate-700 cursor-pointer transition-all duration-200 ${
                isToday ? 'bg-primary/10 border-primary/30' : ''
              } ${isSelected ? 'ring-2 ring-primary' : ''}`}
              onClick={() => date && setSelectedDate(date)}
              whileHover={{ backgroundColor: 'rgba(14, 165, 233, 0.1)' }}
            >
              {date && (
                <>
                  <div className={`text-sm font-medium mb-2 ${
                    isToday ? 'text-primary' : 'text-white'
                  }`}>
                    {date.getDate()}
                  </div>

                  <div className="space-y-1">
                    {jobs.slice(0, 3).map(job => (
                      <motion.div
                        key={job.id}
                        className={`p-1 rounded text-xs truncate ${schedulingService.getStatusColor(job.status)}`}
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex items-center gap-1">
                          {getStatusIcon(job.status)}
                          <span className="truncate">{job.title}</span>
                        </div>
                      </motion.div>
                    ))}

                    {jobs.length > 3 && (
                      <div className="text-xs text-slate-400">
                        +{jobs.length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderListView = () => {
    return (
      <div className="space-y-4">
        {filteredJobs.map(job => (
          <motion.div
            key={job.id}
            className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(job.status)}
                  <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                  {getPriorityIcon(job.priority)}
                </div>

                {job.description && (
                  <p className="text-slate-400 text-sm mb-2">{job.description}</p>
                )}

                <div className="flex items-center gap-4 text-sm text-slate-300">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {schedulingService.formatDate(job.startDate)}
                  </div>

                  {job.startTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {schedulingService.formatTime(job.startTime)} - {schedulingService.formatTime(job.endTime)}
                    </div>
                  )}

                  {job.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-400 mb-2">No scheduled jobs</h3>
            <p className="text-slate-500">Create your first scheduled job to get started.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50 shadow-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Calendar className="w-8 h-8 text-primary" />
          <div>
            <h2 className="text-2xl font-semibold text-white">Job Schedule</h2>
            <p className="text-slate-400">Manage your scheduled jobs and calendar</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-lg font-medium transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
            Schedule Job
          </motion.button>
        </div>
      </div>

      {/* Navigation and Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => viewMode === 'month' ? navigateMonth(-1) : viewMode === 'week' ? navigateWeek(-1) : navigateDay(-1)}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>

            <h3 className="text-lg font-semibold text-white min-w-[200px] text-center">
              {currentDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </h3>

            <motion.button
              onClick={() => viewMode === 'month' ? navigateMonth(1) : viewMode === 'week' ? navigateWeek(1) : navigateDay(1)}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-800 rounded-lg p-1">
            {['month', 'week', 'day'].map(mode => (
              <motion.button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-300 ${
                  viewMode === mode
                    ? 'bg-primary text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-primary focus:outline-none"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-primary focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-primary focus:outline-none"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="min-h-[600px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : viewMode === 'month' ? (
          renderMonthView()
        ) : (
          renderListView()
        )}
      </div>

      {/* Selected Date Jobs */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <h4 className="text-lg font-semibold text-white mb-3">
              Jobs for {schedulingService.formatDate(selectedDate)}
            </h4>

            <div className="space-y-2">
              {getJobsForDate(selectedDate).map(job => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <div className="text-white font-medium">{job.title}</div>
                      {job.startTime && (
                        <div className="text-slate-400 text-sm">
                          {schedulingService.formatTime(job.startTime)} - {schedulingService.formatTime(job.endTime)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs ${schedulingService.getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                </div>
              ))}

              {getJobsForDate(selectedDate).length === 0 && (
                <div className="text-center py-4 text-slate-400">
                  No jobs scheduled for this date
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarDashboard;
