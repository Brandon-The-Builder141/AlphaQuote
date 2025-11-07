/**
 * Job Scheduling Service
 * Handles job scheduling, calendar sync, and scheduling management
 */

import { API_BASE_URL } from '../config/env';

class SchedulingService {
  constructor() {
    this.supportedCalendars = {
      google: 'Google Calendar',
      ical: 'iCal',
      outlook: 'Outlook Calendar'
    };
  }

  /**
   * Create a new scheduled job
   * @param {Object} jobData - Job scheduling data
   * @returns {Object} API response
   */
  async createScheduledJob(jobData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scheduled-jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      const result = await response.json();

      // If auto-sync is enabled, trigger calendar sync
      if (result.success && jobData.autoSync !== false) {
        await this.syncToCalendar(result.data.id);
      }

      return result;
    } catch (error) {
      console.error('Error creating scheduled job:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all scheduled jobs
   * @param {Object} filters - Optional filters (date range, status, etc.)
   * @returns {Object} API response
   */
  async getScheduledJobs(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters);
      const response = await fetch(`${API_BASE_URL}/api/scheduled-jobs?${queryParams}`);
      const result = await response.json();

      return result;
    } catch (error) {
      console.error('Error fetching scheduled jobs:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get scheduled job by ID
   * @param {string} jobId - Job ID
   * @returns {Object} API response
   */
  async getScheduledJob(jobId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scheduled-jobs/${jobId}`);
      const result = await response.json();

      return result;
    } catch (error) {
      console.error('Error fetching scheduled job:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a scheduled job
   * @param {string} jobId - Job ID
   * @param {Object} updateData - Updated job data
   * @returns {Object} API response
   */
  async updateScheduledJob(jobId, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scheduled-jobs/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();

      // If auto-sync is enabled, trigger calendar sync
      if (result.success && updateData.autoSync !== false) {
        await this.syncToCalendar(jobId);
      }

      return result;
    } catch (error) {
      console.error('Error updating scheduled job:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a scheduled job
   * @param {string} jobId - Job ID
   * @returns {Object} API response
   */
  async deleteScheduledJob(jobId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scheduled-jobs/${jobId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      // Remove from calendar if synced
      if (result.success) {
        await this.removeFromCalendar(jobId);
      }

      return result;
    } catch (error) {
      console.error('Error deleting scheduled job:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Schedule a job from an approved estimate
   * @param {Object} estimateData - Approved estimate data
   * @param {Object} scheduleOptions - Scheduling options
   * @returns {Object} API response
   */
  async scheduleFromEstimate(estimateData, scheduleOptions = {}) {
    try {
      const jobData = {
        title: scheduleOptions.title || `${estimateData.jobType || 'Project'} - ${estimateData.clientName || 'Client'}`,
        description: estimateData.description || scheduleOptions.description,
        startDate: scheduleOptions.startDate || new Date().toISOString(),
        endDate: scheduleOptions.endDate || this.calculateEndDate(scheduleOptions.startDate, estimateData.duration),
        startTime: scheduleOptions.startTime || '09:00',
        endTime: scheduleOptions.endTime || '17:00',
        location: estimateData.address || scheduleOptions.location,
        priority: scheduleOptions.priority || 'medium',
        status: 'scheduled',
        estimateId: estimateData.id,
        projectId: estimateData.projectId,
        notes: scheduleOptions.notes || `Scheduled from estimate: ${estimateData.title}`,
        autoSync: scheduleOptions.autoSync !== false
      };

      return await this.createScheduledJob(jobData);
    } catch (error) {
      console.error('Error scheduling from estimate:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get calendar sync settings
   * @returns {Object} API response
   */
  async getCalendarSyncSettings() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/calendar-sync-settings`);
      const result = await response.json();

      return result;
    } catch (error) {
      console.error('Error fetching calendar sync settings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update calendar sync settings
   * @param {Object} settings - Calendar sync settings
   * @returns {Object} API response
   */
  async updateCalendarSyncSettings(settings) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/calendar-sync-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      const result = await response.json();

      return result;
    } catch (error) {
      console.error('Error updating calendar sync settings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Sync job to calendar
   * @param {string} jobId - Job ID
   * @returns {Object} API response
   */
  async syncToCalendar(jobId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scheduled-jobs/${jobId}/sync`, {
        method: 'POST'
      });

      const result = await response.json();

      return result;
    } catch (error) {
      console.error('Error syncing to calendar:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Remove job from calendar
   * @param {string} jobId - Job ID
   * @returns {Object} API response
   */
  async removeFromCalendar(jobId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scheduled-jobs/${jobId}/sync`, {
        method: 'DELETE'
      });

      const result = await response.json();

      return result;
    } catch (error) {
      console.error('Error removing from calendar:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get jobs for a specific date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Object} API response
   */
  async getJobsByDateRange(startDate, endDate) {
    try {
      const filters = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      };

      return await this.getScheduledJobs(filters);
    } catch (error) {
      console.error('Error fetching jobs by date range:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get jobs for today
   * @returns {Object} API response
   */
  async getTodaysJobs() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    return await this.getJobsByDateRange(startOfDay, endOfDay);
  }

  /**
   * Get upcoming jobs (next 7 days)
   * @returns {Object} API response
   */
  async getUpcomingJobs() {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return await this.getJobsByDateRange(today, nextWeek);
  }

  /**
   * Update job status
   * @param {string} jobId - Job ID
   * @param {string} status - New status
   * @returns {Object} API response
   */
  async updateJobStatus(jobId, status) {
    return await this.updateScheduledJob(jobId, { status });
  }

  /**
   * Create recurring job
   * @param {Object} jobData - Job data
   * @param {string} recurrenceRule - RRULE format
   * @returns {Object} API response
   */
  async createRecurringJob(jobData, recurrenceRule) {
    const recurringJobData = {
      ...jobData,
      isRecurring: true,
      recurrenceRule
    };

    return await this.createScheduledJob(recurringJobData);
  }

  /**
   * Get job statistics
   * @returns {Object} API response
   */
  async getJobStatistics() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/scheduled-jobs/statistics`);
      const result = await response.json();

      return result;
    } catch (error) {
      console.error('Error fetching job statistics:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper method to calculate end date
   * @param {Date|string} startDate - Start date
   * @param {number} duration - Duration in days
   * @returns {Date} End date
   */
  calculateEndDate(startDate, duration = 1) {
    const start = new Date(startDate);
    const end = new Date(start.getTime() + duration * 24 * 60 * 60 * 1000);
    return end.toISOString();
  }

  /**
   * Format time for display
   * @param {string} time - Time in HH:MM format
   * @returns {string} Formatted time
   */
  formatTime(time) {
    if (!time) return '';

    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minutes} ${ampm}`;
  }

  /**
   * Format date for display
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted date
   */
  formatDate(date) {
    if (!date) return '';

    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Get status color for UI
   * @param {string} status - Job status
   * @returns {string} CSS color class
   */
  getStatusColor(status) {
    const colors = {
      scheduled: 'text-blue-400 bg-blue-900/20 border-blue-500/30',
      in_progress: 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30',
      completed: 'text-green-400 bg-green-900/20 border-green-500/30',
      cancelled: 'text-red-400 bg-red-900/20 border-red-500/30'
    };

    return colors[status] || colors.scheduled;
  }

  /**
   * Get priority color for UI
   * @param {string} priority - Job priority
   * @returns {string} CSS color class
   */
  getPriorityColor(priority) {
    const colors = {
      low: 'text-gray-400 bg-gray-900/20 border-gray-500/30',
      medium: 'text-blue-400 bg-blue-900/20 border-blue-500/30',
      high: 'text-orange-400 bg-orange-900/20 border-orange-500/30',
      urgent: 'text-red-400 bg-red-900/20 border-red-500/30'
    };

    return colors[priority] || colors.medium;
  }

  /**
   * Get supported calendar types
   * @returns {Object} Supported calendars
   */
  getSupportedCalendars() {
    return this.supportedCalendars;
  }

  /**
   * Validate job data
   * @param {Object} jobData - Job data to validate
   * @returns {Object} Validation result
   */
  validateJobData(jobData) {
    const errors = [];

    if (!jobData.title || jobData.title.trim() === '') {
      errors.push('Job title is required');
    }

    if (!jobData.startDate) {
      errors.push('Start date is required');
    }

    if (!jobData.endDate) {
      errors.push('End date is required');
    }

    if (jobData.startDate && jobData.endDate) {
      const start = new Date(jobData.startDate);
      const end = new Date(jobData.endDate);

      if (end <= start) {
        errors.push('End date must be after start date');
      }
    }

    if (jobData.startTime && jobData.endTime) {
      const startTime = jobData.startTime.split(':');
      const endTime = jobData.endTime.split(':');

      if (startTime[0] > endTime[0] || (startTime[0] === endTime[0] && startTime[1] >= endTime[1])) {
        errors.push('End time must be after start time');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Create singleton instance
const schedulingService = new SchedulingService();

export default schedulingService;
