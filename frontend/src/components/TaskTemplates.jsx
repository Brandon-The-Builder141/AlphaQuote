/**
 * TaskTemplates Component
 *
 * Provides a quick templates/favorite tasks module for saving and reusing
 * frequently used tasks or groups of tasks in quotes.
 *
 * Features:
 * - Browse and search task templates
 * - Drag-and-drop or click-to-add templates to current quote
 * - Create, edit, and delete templates
 * - Category filtering and organization
 * - Consistent UI styling with current quote page
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess, showError } from '../utils/toastService';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Star,
  Copy,
  X,
  ChevronDown,
  ChevronUp,
  Package,
  Building,
  Home,
  Wrench
} from 'lucide-react';
import { API_BASE_URL } from '../config/env';

const TaskTemplates = ({ onAddTasks, onClose }) => {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [expandedTemplate, setExpandedTemplate] = useState(null);
  const [dragOverTemplate, setDragOverTemplate] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'General',
    isPublic: false,
    tasks: []
  });

  const searchRef = useRef(null);

  // Categories with icons
  const categories = [
    { value: 'all', label: 'All Templates', icon: Package },
    { value: 'Kitchen', label: 'Kitchen', icon: Home },
    { value: 'Bathroom', label: 'Bathroom', icon: Building },
    { value: 'General', label: 'General', icon: Wrench },
    { value: 'Flooring', label: 'Flooring', icon: FileText },
    { value: 'Paint', label: 'Paint', icon: Edit3 },
    { value: 'Electrical', label: 'Electrical', icon: Wrench },
    { value: 'Plumbing', label: 'Plumbing', icon: Wrench }
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedCategory]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/task-templates?userId=default`);
      const data = await response.json();

      if (data.success) {
        setTemplates(data.templates || []);
      } else {
        console.error('Failed to fetch templates:', data.error);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchLower) ||
        template.description?.toLowerCase().includes(searchLower) ||
        template.tasks.some(task =>
          task.name.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
        )
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleCreateTemplate = async () => {
    if (!formData.name.trim()) {
      showError('Please enter a template name');
      return;
    }

    if (formData.tasks.length === 0) {
      showError('Please add at least one task to the template');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/task-templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: 'default'
        })
      });

      const data = await response.json();

      if (data.success) {
        setTemplates(prev => [data.template, ...prev]);
        setShowCreateForm(false);
        resetForm();
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
    if (!formData.name.trim()) {
      showError('Please enter a template name');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/task-templates/${editingTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? data.template : t));
        setEditingTemplate(null);
        resetForm();
        showSuccess('Template updated successfully!');
      } else {
        showError(`Failed to update template: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating template:', error);
      showError('Failed to update template');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    // TODO: Replace with proper modal confirmation
    const confirmed = window.confirm('Are you sure you want to delete this template? This action cannot be undone.');
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/task-templates/${templateId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
        showSuccess('Template deleted successfully!');
      } else {
        showError(`Failed to delete template: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      showError('Failed to delete template');
    }
  };

  const handleAddTemplateToQuote = (template) => {
    const tasksToAdd = template.tasks.map(task => ({
      name: task.name,
      description: task.description,
      category: task.category,
      quantity: task.quantity,
      unit: task.unit,
      unitPrice: task.unitPrice
    }));

    onAddTasks(tasksToAdd);
    onClose();
  };

  const handleDragStart = (e, template) => {
    e.dataTransfer.setData('application/json', JSON.stringify(template));
  };

  const handleDragOver = (e, templateId) => {
    e.preventDefault();
    setDragOverTemplate(templateId);
  };

  const handleDragLeave = () => {
    setDragOverTemplate(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'General',
      isPublic: false,
      tasks: []
    });
  };

  const startEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      category: template.category || 'General',
      isPublic: template.isPublic,
      tasks: template.tasks.map(task => ({
        name: task.name,
        description: task.description || '',
        category: task.category || '',
        unit: task.unit || '',
        quantity: task.quantity || 1,
        unitPrice: task.unitPrice || 0
      }))
    });
    setShowCreateForm(true);
  };

  const calculateTemplateTotal = (template) => {
    return template.tasks.reduce((total, task) => {
      return total + (parseFloat(task.totalPrice) || 0);
    }, 0);
  };

  if (loading) {
    return (
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-slate-900/90 backdrop-blur-sm p-8 rounded-2xl border border-slate-800/50"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <div className="flex items-center gap-3 text-slate-300">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
            Loading templates...
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        className="bg-slate-900/90 backdrop-blur-sm rounded-2xl border border-slate-800/50 shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-xl">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">Quick Templates</h2>
                <p className="text-slate-400 text-sm">Save and reuse frequently used tasks</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  resetForm();
                  setShowCreateForm(true);
                  setEditingTemplate(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-xl hover:bg-primary/30 transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                New Template
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search templates and tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {categories.map(category => {
                  const Icon = category.icon;
                  return (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {showCreateForm ? (
            <CreateTemplateForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
              onCancel={() => {
                setShowCreateForm(false);
                setEditingTemplate(null);
                resetForm();
              }}
              isEditing={!!editingTemplate}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredTemplates.map((template) => (
                  <motion.div
                    key={template.id}
                    className={`bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 hover:border-primary/50 transition-all duration-300 cursor-pointer group ${
                      dragOverTemplate === template.id ? 'border-primary/50 bg-primary/10' : ''
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    draggable
                    onDragStart={(e) => handleDragStart(e, template)}
                    onDragOver={(e) => handleDragOver(e, template.id)}
                    onDragLeave={handleDragLeave}
                    onClick={() => setExpandedTemplate(expandedTemplate === template.id ? null : template.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-xl">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                            {template.name}
                          </h3>
                          <p className="text-sm text-slate-400">
                            {template.category} • {template.tasks.length} tasks
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(template);
                          }}
                          className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/20 rounded-lg transition-all"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(template.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/20 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {template.description && (
                      <p className="text-sm text-slate-300 mb-4 line-clamp-2">
                        {template.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-semibold text-primary">
                        ${calculateTemplateTotal(template).toFixed(2)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddTemplateToQuote(template);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-all duration-200 text-sm"
                      >
                        <Copy className="h-4 w-4" />
                        Add to Quote
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        {template.isPublic ? (
                          <>
                            <Star className="h-3 w-3" />
                            Public
                          </>
                        ) : (
                          'Private'
                        )}
                      </div>
                      <button
                        className="text-xs text-slate-400 hover:text-white transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedTemplate(expandedTemplate === template.id ? null : template.id);
                        }}
                      >
                        {expandedTemplate === template.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <AnimatePresence>
                      {expandedTemplate === template.id && (
                        <motion.div
                          className="mt-4 pt-4 border-t border-slate-700/50"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <div className="space-y-2">
                            {template.tasks.map((task, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <div>
                                  <span className="text-white">{task.name}</span>
                                  {task.description && (
                                    <span className="text-slate-400 ml-2">• {task.description}</span>
                                  )}
                                </div>
                                <span className="text-primary font-medium">
                                  ${parseFloat(task.totalPrice || 0).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {filteredTemplates.length === 0 && !showCreateForm && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">
                {searchTerm || selectedCategory !== 'all' ? 'No templates found' : 'No templates yet'}
              </h3>
              <p className="text-slate-500 mb-6">
                {searchTerm || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first template to get started with quick task insertion'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && (
                <button
                  onClick={() => {
                    resetForm();
                    setShowCreateForm(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-primary/20 text-primary rounded-xl hover:bg-primary/30 transition-all duration-200 mx-auto"
                >
                  <Plus className="h-5 w-5" />
                  Create Your First Template
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// Create/Edit Template Form Component
const CreateTemplateForm = ({ formData, setFormData, onSubmit, onCancel, isEditing }) => {
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    category: '',
    unit: '',
    quantity: 1,
    unitPrice: 0
  });

  const handleAddTask = () => {
    if (!newTask.name.trim()) {
      showError('Please enter a task name');
      return;
    }

    const task = {
      ...newTask,
      totalPrice: (parseFloat(newTask.quantity) || 1) * (parseFloat(newTask.unitPrice) || 0)
    };

    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, task]
    }));

    setNewTask({
      name: '',
      description: '',
      category: '',
      unit: '',
      quantity: 1,
      unitPrice: 0
    });
  };

  const handleRemoveTask = (index) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateTask = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => {
        if (i === index) {
          const updatedTask = { ...task, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updatedTask.totalPrice = (parseFloat(updatedTask.quantity) || 1) * (parseFloat(updatedTask.unitPrice) || 0);
          }
          return updatedTask;
        }
        return task;
      })
    }));
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6">
        <h3 className="text-xl font-semibold text-white mb-6">
          {isEditing ? 'Edit Template' : 'Create New Template'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Template Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="e.g., Kitchen Remodel - Basic"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="General">General</option>
              <option value="Kitchen">Kitchen</option>
              <option value="Bathroom">Bathroom</option>
              <option value="Flooring">Flooring</option>
              <option value="Paint">Paint</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
            rows="3"
            placeholder="Describe what this template is for..."
          />
        </div>

        <div className="flex items-center gap-3 mb-6">
          <input
            type="checkbox"
            id="isPublic"
            checked={formData.isPublic}
            onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
            className="w-4 h-4 text-primary bg-slate-700 border-slate-600 rounded focus:ring-primary/50"
          />
          <label htmlFor="isPublic" className="text-sm text-slate-300">
            Make this template public (visible to all users)
          </label>
        </div>

        {/* Add New Task */}
        <div className="bg-slate-700/30 rounded-xl p-4 mb-6">
          <h4 className="text-lg font-medium text-white mb-4">Add New Task</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Task Name *
              </label>
              <input
                type="text"
                value={newTask.name}
                onChange={(e) => setNewTask(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., Install Flooring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Category
              </label>
              <input
                type="text"
                value={newTask.category}
                onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., Flooring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Unit
              </label>
              <input
                type="text"
                value={newTask.unit}
                onChange={(e) => setNewTask(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g., sq ft"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Quantity
              </label>
              <input
                type="number"
                value={newTask.quantity}
                onChange={(e) => setNewTask(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 1 }))}
                className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Unit Price ($)
              </label>
              <input
                type="number"
                value={newTask.unitPrice}
                onChange={(e) => setNewTask(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                min="0"
                step="0.01"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddTask}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                Add Task
              </button>
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <input
              type="text"
              value={newTask.description}
              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-600/50 border border-slate-500/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Optional task description..."
            />
          </div>
        </div>

        {/* Tasks List */}
        {formData.tasks.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-medium text-white mb-4">
              Template Tasks ({formData.tasks.length})
            </h4>
            <div className="space-y-3">
              {formData.tasks.map((task, index) => (
                <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <input
                        type="text"
                        value={task.name}
                        onChange={(e) => handleUpdateTask(index, 'name', e.target.value)}
                        className="px-3 py-2 bg-slate-600/50 border border-slate-500/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Task name"
                      />
                      <input
                        type="text"
                        value={task.category}
                        onChange={(e) => handleUpdateTask(index, 'category', e.target.value)}
                        className="px-3 py-2 bg-slate-600/50 border border-slate-500/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="Category"
                      />
                      <input
                        type="number"
                        value={task.quantity}
                        onChange={(e) => handleUpdateTask(index, 'quantity', parseFloat(e.target.value) || 1)}
                        className="px-3 py-2 bg-slate-600/50 border border-slate-500/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        min="0"
                        step="0.1"
                      />
                      <input
                        type="number"
                        value={task.unitPrice}
                        onChange={(e) => handleUpdateTask(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="px-3 py-2 bg-slate-600/50 border border-slate-500/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveTask(index)}
                      className="ml-3 p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/20 rounded-lg transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={task.description}
                      onChange={(e) => handleUpdateTask(index, 'description', e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-600/50 border border-slate-500/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/50 mr-3"
                      placeholder="Task description (optional)"
                    />
                    <span className="text-primary font-semibold">
                      ${parseFloat(task.totalPrice || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-primary/10 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-white">Total Template Cost:</span>
                <span className="text-2xl font-bold text-primary">
                  ${formData.tasks.reduce((total, task) => total + (parseFloat(task.totalPrice) || 0), 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3">
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
  );
};

export default TaskTemplates;
