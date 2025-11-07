/**
 * Schedule Job Modal Component
 * Modal for creating and editing scheduled jobs
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
  Save,
  Plus
} from 'lucide-react';
import schedulingService from '../services/schedulingService';

const ScheduleJobModal = ({ 
  isOpen, 
  onClose, 
  jobData = null, 
  estimateData = null,
  onSave 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '17:00',
    status: 'scheduled',
    priority: 'medium',
    location: '',
    notes: '',
    isRecurring: false,
    recurrenceRule: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (jobData) {
        // Edit existing job
        setFormData({
          title: jobData.title || '',
          description: jobData.description || '',
          startDate: jobData.startDate ? new Date(jobData.startDate).toISOString().split('T')[0] : '',
          endDate: jobData.endDate ? new Date(jobData.endDate).toISOString().split('T')[0] : '',
          startTime: jobData.startTime || '09:00',
          endTime: jobData.endTime || '17:00',
          status: jobData.status || 'scheduled',
          priority: jobData.priority || 'medium',
          location: jobData.location || '',
          notes: jobData.notes || '',
          isRecurring: jobData.isRecurring || false,
          recurrenceRule: jobData.recurrenceRule || ''
        });
      } else if (estimateData) {
        // Create from estimate
        setFormData({
          title: `${estimateData.jobType || 'Project'} - ${estimateData.clientName || 'Client'}`,
          description: estimateData.description || '',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '17:00',
          status: 'scheduled',
          priority: 'medium',
          location: estimateData.address || '',
          notes: `Scheduled from estimate: ${estimateData.title || 'Project'}`,
          isRecurring: false,
          recurrenceRule: ''
        });
      } else {
        // Create new job
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        setFormData({
          title: '',
          description: '',
          startDate: today.toISOString().split('T')[0],
          endDate: nextWeek.toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '17:00',
          status: 'scheduled',
          priority: 'medium',
          location: '',
          notes: '',
          isRecurring: false,
          recurrenceRule: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, jobData, estimateData]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      
      if (endDate <= startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    if (formData.startTime && formData.endTime) {
      const startTime = formData.startTime.split(':');
      const endTime = formData.endTime.split(':');
      
      if (startTime[0] > endTime[0] || (startTime[0] === endTime[0] && startTime[1] >= endTime[1])) {
        newErrors.endTime = 'End time must be after start time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const jobData = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        estimateId: estimateData?.id
      };

      let result;
      if (jobData.id) {
        // Update existing job
        result = await schedulingService.updateScheduledJob(jobData.id, jobData);
      } else {
        // Create new job
        result = await schedulingService.createScheduledJob(jobData);
      }

      if (result.success) {
        onSave && onSave(result.data);
        onClose();
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-400 bg-gray-900/20 border-gray-500/30',
      medium: 'text-blue-400 bg-blue-900/20 border-blue-500/30',
      high: 'text-orange-400 bg-orange-900/20 border-orange-500/30',
      urgent: 'text-red-400 bg-red-900/20 border-red-500/30'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'text-blue-400 bg-blue-900/20 border-blue-500/30',
      in_progress: 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30',
      completed: 'text-green-400 bg-green-900/20 border-green-500/30',
      cancelled: 'text-red-400 bg-red-900/20 border-red-500/30'
    };
    return colors[status] || colors.scheduled;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-slate-900 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-800/50 shadow-xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-semibold text-white">
                  {jobData ? 'Edit Job' : estimateData ? 'Schedule from Estimate' : 'Schedule New Job'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400">{errors.general}</span>
              </div>
            )}

            {/* Form */}
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-400 focus:border-primary focus:outline-none ${
                    errors.title ? 'border-red-500' : 'border-slate-700'
                  }`}
                  placeholder="Enter job title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-400">{errors.title}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-primary focus:outline-none"
                  placeholder="Enter job description"
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white focus:border-primary focus:outline-none ${
                      errors.startDate ? 'border-red-500' : 'border-slate-700'
                    }`}
                  />
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-400">{errors.startDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white focus:border-primary focus:outline-none ${
                      errors.endDate ? 'border-red-500' : 'border-slate-700'
                    }`}
                  />
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-400">{errors.endDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-white focus:border-primary focus:outline-none ${
                      errors.endTime ? 'border-red-500' : 'border-slate-700'
                    }`}
                  />
                  {errors.endTime && (
                    <p className="mt-1 text-sm text-red-400">{errors.endTime}</p>
                  )}
                </div>
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-primary focus:outline-none"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-primary focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-primary focus:outline-none"
                  placeholder="Enter job location"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-primary focus:outline-none"
                  placeholder="Additional notes"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 mt-8">
              <button
                onClick={onClose}
                className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              
              <motion.button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-300"
                whileHover={!isLoading ? { scale: 1.05 } : {}}
                whileTap={!isLoading ? { scale: 0.95 } : {}}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {jobData ? 'Update Job' : 'Schedule Job'}
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ScheduleJobModal;
