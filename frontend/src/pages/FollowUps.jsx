/**
 * Automated Follow-Ups Dashboard
 *
 * Provides follow-up reminder management for quotes:
 * - Schedule follow-up reminders after quotes are sent
 * - Manage email templates for follow-ups
 * - Track follow-up status (pending, sent)
 * - Simple dashboard showing upcoming and past follow-ups
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess, showError } from '../utils/toastService';
import {
  Clock,
  Mail,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  User,
  RefreshCw,
  Filter
} from 'lucide-react';
import { API_BASE_URL } from '../config/env';

const FollowUps = () => {
  const [loading, setLoading] = useState(true);
  const [followUps, setFollowUps] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [editingFollowUp, setEditingFollowUp] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);

  // Form states
  const [followUpForm, setFollowUpForm] = useState({
    clientEmail: '',
    clientName: '',
    subject: '',
    message: '',
    scheduledDate: '',
    templateId: ''
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    message: '',
    isDefault: false
  });

  useEffect(() => {
    fetchData();
  }, [selectedStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [followUpsResponse, templatesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/followups?status=${selectedStatus}`),
        fetch(`${API_BASE_URL}/api/followup-templates`)
      ]);

      const followUpsData = await followUpsResponse.json();
      const templatesData = await templatesResponse.json();

      if (followUpsData.success) {
        setFollowUps(followUpsData.followUps);
      }

      if (templatesData.success) {
        setTemplates(templatesData.templates);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFollowUp = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/followups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(followUpForm)
      });

      const data = await response.json();

      if (data.success) {
        setFollowUps(prev => [data.followUp, ...prev]);
        setShowCreateForm(false);
        resetFollowUpForm();
        showSuccess('Follow-up created successfully!');
      } else {
        showError(`Failed to create follow-up: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating follow-up:', error);
      showError('Failed to create follow-up');
    }
  };

  const handleUpdateFollowUp = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/followups/${editingFollowUp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(followUpForm)
      });

      const data = await response.json();

      if (data.success) {
        setFollowUps(prev => prev.map(f => f.id === editingFollowUp.id ? data.followUp : f));
        setEditingFollowUp(null);
        resetFollowUpForm();
        showSuccess('Follow-up updated successfully!');
      } else {
        showError(`Failed to update follow-up: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating follow-up:', error);
      showError('Failed to update follow-up');
    }
  };

  const handleDeleteFollowUp = async (id) => {
    // TODO: Replace with proper modal confirmation
    const confirmed = window.confirm('Are you sure you want to delete this follow-up?');
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/followups/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        setFollowUps(prev => prev.filter(f => f.id !== id));
        showSuccess('Follow-up deleted successfully!');
      } else {
        showError(`Failed to delete follow-up: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting follow-up:', error);
      showError('Failed to delete follow-up');
    }
  };

  const handleMarkAsSent = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/followups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'sent' })
      });

      const data = await response.json();

      if (data.success) {
        setFollowUps(prev => prev.map(f => f.id === id ? data.followUp : f));
        showSuccess('Marked as sent successfully!');
      } else {
        showError(`Failed to mark as sent: ${data.error}`);
      }
    } catch (error) {
      console.error('Error marking as sent:', error);
      showError('Failed to mark as sent');
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/followup-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm)
      });

      const data = await response.json();

      if (data.success) {
        setTemplates(prev => [...prev, data.template]);
        setShowTemplateForm(false);
        resetTemplateForm();
        showSuccess('Template created successfully!');
      } else {
        showError(`Failed to create template: ${data.error}`);
      }
    } catch (error) {
      console.error('Error creating template:', error);
      showError('Failed to create template');
    }
  };

  const handleUpdateTemplate = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/followup-templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateForm)
      });

      const data = await response.json();

      if (data.success) {
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? data.template : t));
        setEditingTemplate(null);
        resetTemplateForm();
        showSuccess('Template updated successfully!');
      } else {
        showError(`Failed to update template: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating template:', error);
      showError('Failed to update template');
    }
  };

  const handleDeleteTemplate = async (id) => {
    // TODO: Replace with proper modal confirmation
    const confirmed = window.confirm('Are you sure you want to delete this template?');
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/followup-templates/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        setTemplates(prev => prev.filter(t => t.id !== id));
        showSuccess('Template deleted successfully!');
      } else {
        showError(`Failed to delete template: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      showError('Failed to delete template');
    }
  };

  const handleUseTemplate = (template) => {
    setFollowUpForm(prev => ({
      ...prev,
      subject: template.subject,
      message: template.message,
      templateId: template.id
    }));
  };

  const resetFollowUpForm = () => {
    setFollowUpForm({
      clientEmail: '',
      clientName: '',
      subject: '',
      message: '',
      scheduledDate: '',
      templateId: ''
    });
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      subject: '',
      message: '',
      isDefault: false
    });
  };

  const startEditFollowUp = (followUp) => {
    setEditingFollowUp(followUp);
    setFollowUpForm({
      clientEmail: followUp.clientEmail,
      clientName: followUp.clientName || '',
      subject: followUp.subject,
      message: followUp.message,
      scheduledDate: followUp.scheduledDate.split('T')[0],
      templateId: followUp.templateId || ''
    });
    setShowCreateForm(true);
  };

  const startEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      subject: template.subject,
      message: template.message,
      isDefault: template.isDefault
    });
    setShowTemplateForm(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'sent':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-slate-300">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            Loading follow-ups...
          </div>
        </div>
      </div>
    );
  }

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
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Automated Follow-Ups</h1>
              <p className="text-slate-400">Schedule and manage follow-up reminders</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTemplateForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-all duration-200"
            >
              <FileText className="h-4 w-4" />
              Templates
            </button>
            <button
              onClick={() => {
                resetFollowUpForm();
                setShowCreateForm(true);
                setEditingFollowUp(null);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-xl hover:bg-primary/30 transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              New Follow-Up
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
            <span className="text-sm font-medium text-slate-300">Filter by status:</span>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-lg transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Follow-ups List */}
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {followUps.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-12 border border-slate-700/50 text-center">
            <Mail className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">No follow-ups yet</h3>
            <p className="text-slate-500 mb-6">Create your first follow-up reminder to get started</p>
            <button
              onClick={() => {
                resetFollowUpForm();
                setShowCreateForm(true);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-primary/20 text-primary rounded-xl hover:bg-primary/30 transition-all duration-200 mx-auto"
            >
              <Plus className="h-5 w-5" />
              Create Follow-Up
            </button>
          </div>
        ) : (
          followUps.map((followUp) => (
            <motion.div
              key={followUp.id}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/20 rounded-xl">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{followUp.subject}</h3>
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {followUp.clientName || followUp.clientEmail}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(followUp.scheduledDate)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(followUp.status)}`}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(followUp.status)}
                      {followUp.status}
                    </div>
                  </span>

                  <div className="flex items-center gap-2">
                    {followUp.status === 'pending' && (
                      <button
                        onClick={() => handleMarkAsSent(followUp.id)}
                        className="p-2 text-green-400 hover:bg-green-400/20 rounded-lg transition-all"
                        title="Mark as sent"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => startEditFollowUp(followUp)}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-primary/20 rounded-lg transition-all"
                      title="Edit follow-up"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFollowUp(followUp.id)}
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/20 rounded-lg transition-all"
                      title="Delete follow-up"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-slate-300 text-sm mb-4 line-clamp-3">{followUp.message}</p>

              {followUp.template && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <FileText className="h-3 w-3" />
                  Template: {followUp.template.name}
                </div>
              )}
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Create/Edit Follow-up Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <CreateFollowUpModal
            formData={followUpForm}
            setFormData={setFollowUpForm}
            templates={templates}
            onSubmit={editingFollowUp ? handleUpdateFollowUp : handleCreateFollowUp}
            onCancel={() => {
              setShowCreateForm(false);
              setEditingFollowUp(null);
              resetFollowUpForm();
            }}
            onUseTemplate={handleUseTemplate}
            isEditing={!!editingFollowUp}
          />
        )}
      </AnimatePresence>

      {/* Create/Edit Template Modal */}
      <AnimatePresence>
        {showTemplateForm && (
          <CreateTemplateModal
            formData={templateForm}
            setFormData={setTemplateForm}
            onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
            onCancel={() => {
              setShowTemplateForm(false);
              setEditingTemplate(null);
              resetTemplateForm();
            }}
            isEditing={!!editingTemplate}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Create/Edit Follow-up Modal Component
const CreateFollowUpModal = ({ formData, setFormData, templates, onSubmit, onCancel, onUseTemplate, isEditing }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-800/50 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {isEditing ? 'Edit Follow-Up' : 'Create Follow-Up'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-200"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Templates */}
          {templates.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Quick Templates
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => onUseTemplate(template)}
                    className="p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg border border-slate-600/30 hover:border-primary/30 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">{template.name}</span>
                      {template.isDefault && (
                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Default</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{template.subject}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Client Email *
              </label>
              <input
                type="email"
                value={formData.clientEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="client@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Client Name
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Scheduled Date *
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledDate}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Follow-up on your quote"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Message *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows="4"
              placeholder="Hi [Client Name], I wanted to follow up on the quote I sent..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              onClick={onCancel}
              className="px-6 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="px-6 py-2 bg-primary/20 text-primary rounded-xl hover:bg-primary/30 transition-all duration-200"
            >
              {isEditing ? 'Update Follow-Up' : 'Create Follow-Up'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Create/Edit Template Modal Component
const CreateTemplateModal = ({ formData, setFormData, onSubmit, onCancel, isEditing }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-800/50 shadow-2xl w-full max-w-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {isEditing ? 'Edit Template' : 'Create Template'}
            </h2>
            <button
              onClick={onCancel}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-200"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Template Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Standard Follow-up"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Follow-up on your quote"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Message *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
              rows="6"
              placeholder="Hi [Client Name], I wanted to follow up on the quote I sent..."
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
              className="w-4 h-4 text-primary bg-slate-700 border-slate-600 rounded focus:ring-primary/50"
            />
            <label htmlFor="isDefault" className="text-sm text-slate-300">
              Set as default template
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              onClick={onCancel}
              className="px-6 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="px-6 py-2 bg-primary/20 text-primary rounded-xl hover:bg-primary/30 transition-all duration-200"
            >
              {isEditing ? 'Update Template' : 'Create Template'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FollowUps;
