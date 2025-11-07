/**
 * ChangeOrderManager Component
 *
 * Handles adding optional tasks/items mid-quote as change orders.
 * Maintains history of changes and updates live quote totals.
 *
 * Features:
 * - Add new tasks or items
 * - Real-time total updates
 * - Change history tracking
 * - Separate display in preview
 *
 * @component
 * @example
 * <ChangeOrderManager
 *   onAddChangeOrder={handleAddChangeOrder}
 *   changeOrders={changeOrders}
 *   onUpdateChangeOrder={handleUpdateChangeOrder}
 *   onRemoveChangeOrder={handleRemoveChangeOrder}
 * />
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit3,
  Trash2,
  Clock,
  DollarSign,
  Package,
  Hammer,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const ChangeOrderManager = ({
  onAddChangeOrder,
  changeOrders = [],
  onUpdateChangeOrder,
  onRemoveChangeOrder
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChangeOrder, setNewChangeOrder] = useState({
    id: '',
    type: 'task', // 'task' or 'item'
    description: '',
    quantity: 1,
    unit: 'ea',
    unitPrice: 0,
    laborHours: 0,
    laborRate: 75,
    notes: '',
    category: 'General'
  });
  const [editingId, setEditingId] = useState(null);

  // Generate unique ID for new change orders
  useEffect(() => {
    if (showAddForm && !newChangeOrder.id) {
      setNewChangeOrder(prev => ({
        ...prev,
        id: `change_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }));
    }
  }, [showAddForm, newChangeOrder.id]);

  const handleAddChangeOrder = () => {
    if (!newChangeOrder.description.trim()) {
      alert('Please enter a description for the change order.');
      return;
    }

    const changeOrder = {
      ...newChangeOrder,
      timestamp: new Date().toISOString(),
      totalCost: calculateTotalCost(newChangeOrder)
    };

    onAddChangeOrder(changeOrder);

    // Reset form
    setNewChangeOrder({
      id: '',
      type: 'task',
      description: '',
      quantity: 1,
      unit: 'ea',
      unitPrice: 0,
      laborHours: 0,
      laborRate: 75,
      notes: '',
      category: 'General'
    });
    setShowAddForm(false);
  };

  const handleUpdateChangeOrder = (id, updatedData) => {
    const updatedChangeOrder = {
      ...updatedData,
      totalCost: calculateTotalCost(updatedData)
    };
    onUpdateChangeOrder(id, updatedChangeOrder);
    setEditingId(null);
  };

  const calculateTotalCost = (changeOrder) => {
    const materialCost = changeOrder.quantity * changeOrder.unitPrice;
    const laborCost = changeOrder.laborHours * changeOrder.laborRate;
    return materialCost + laborCost;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getTypeIcon = (type) => {
    return type === 'task' ? <Hammer className="w-4 h-4" /> : <Package className="w-4 h-4" />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      'General': 'bg-slate-100 text-slate-800',
      'Materials': 'bg-blue-100 text-blue-800',
      'Labor': 'bg-green-100 text-green-800',
      'Equipment': 'bg-purple-100 text-purple-800',
      'Permits': 'bg-orange-100 text-orange-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors['General'];
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Change Orders</h3>
            <p className="text-sm text-slate-600">Add optional tasks or items mid-quote</p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add Change</span>
        </motion.button>
      </div>

      {/* Add Change Order Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-blue-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Type
                </label>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setNewChangeOrder(prev => ({ ...prev, type: 'task' }))}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      newChangeOrder.type === 'task'
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Hammer className="w-4 h-4" />
                    <span>Task</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewChangeOrder(prev => ({ ...prev, type: 'item' }))}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      newChangeOrder.type === 'item'
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span>Item</span>
                  </button>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Category
                </label>
                <select
                  value={newChangeOrder.category}
                  onChange={(e) => setNewChangeOrder(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="General">General</option>
                  <option value="Materials">Materials</option>
                  <option value="Labor">Labor</option>
                  <option value="Equipment">Equipment</option>
                  <option value="Permits">Permits</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={newChangeOrder.description}
                  onChange={(e) => setNewChangeOrder(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the task or item to be added..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                />
              </div>

              {/* Quantity and Unit */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Quantity
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={newChangeOrder.quantity}
                    onChange={(e) => setNewChangeOrder(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={newChangeOrder.unit}
                    onChange={(e) => setNewChangeOrder(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="Unit"
                    className="w-20 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Unit Price */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Unit Price
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newChangeOrder.unitPrice}
                    onChange={(e) => setNewChangeOrder(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Labor Hours */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Labor Hours
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={newChangeOrder.laborHours}
                    onChange={(e) => setNewChangeOrder(prev => ({ ...prev, laborHours: parseFloat(e.target.value) || 0 }))}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.0"
                  />
                </div>
              </div>

              {/* Labor Rate */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Labor Rate ($/hr)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newChangeOrder.laborRate}
                    onChange={(e) => setNewChangeOrder(prev => ({ ...prev, laborRate: parseFloat(e.target.value) || 0 }))}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="75.00"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={newChangeOrder.notes}
                  onChange={(e) => setNewChangeOrder(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes or specifications..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 mt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddChangeOrder}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                Add Change Order
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Orders List */}
      <div className="space-y-4">
        {changeOrders.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">No change orders added yet</p>
            <p className="text-sm text-slate-500">Click "Add Change" to add optional tasks or items</p>
          </div>
        ) : (
          changeOrders.map((changeOrder, index) => (
            <motion.div
              key={changeOrder.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/20 p-4 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getTypeIcon(changeOrder.type)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(changeOrder.category)}`}>
                      {changeOrder.category}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatTimestamp(changeOrder.timestamp)}
                    </span>
                  </div>

                  <h4 className="font-medium text-slate-900 mb-2">
                    {changeOrder.description}
                  </h4>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Quantity:</span>
                      <span className="ml-1 font-medium">{changeOrder.quantity} {changeOrder.unit}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Unit Price:</span>
                      <span className="ml-1 font-medium">{formatCurrency(changeOrder.unitPrice)}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Labor:</span>
                      <span className="ml-1 font-medium">{changeOrder.laborHours}h @ {formatCurrency(changeOrder.laborRate)}/hr</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Total:</span>
                      <span className="ml-1 font-bold text-green-600">{formatCurrency(changeOrder.totalCost)}</span>
                    </div>
                  </div>

                  {changeOrder.notes && (
                    <div className="mt-2 p-2 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-700">{changeOrder.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setEditingId(changeOrder.id)}
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onRemoveChangeOrder(changeOrder.id)}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Summary */}
      {changeOrders.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-slate-900">
                {changeOrders.length} Change Order{changeOrders.length !== 1 ? 's' : ''} Added
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-600">Total Change Orders</div>
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(changeOrders.reduce((sum, co) => sum + co.totalCost, 0))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChangeOrderManager;
