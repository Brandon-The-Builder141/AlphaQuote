import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  CheckSquare,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Square,
  DollarSign,
  Clock,
  Package,
  Hammer,
  ShoppingCart
} from 'lucide-react';
import CartImportFlow from '../CartImportFlow';
import { showSuccess } from '../../utils/toastService';

export default function WorkItemsSetupStep({ data, updateData, onNext, onBack }) {
  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms' or 'tasks'
  const [showCartImport, setShowCartImport] = useState(false);

  // Handle cart import - convert cart items to work items
  const handleCartImport = (cartItems) => {
    const newWorkItems = cartItems.map(item => ({
      id: Date.now() + Math.random(), // Unique ID
      type: 'room',
      name: item.name,
      sqft: item.quantity || 1,
      materialDescription: item.name,
      materialCost: item.unitPrice.toFixed(2),
      laborDescription: 'Installation',
      laborHours: Math.ceil((item.quantity || 1) / 10), // Estimate 1 hour per 10 units
      demo: false,
      trim: false,
      paint: false
    }));

    updateData({ workItems: [...(data.workItems || []), ...newWorkItems] });
    showSuccess(`Imported ${cartItems.length} items from cart!`);
  };

  const addRoom = () => {
    const newItem = {
      id: Date.now(),
      type: 'room',
      name: '',
      sqft: 0,
      materialDescription: '',
      materialCost: '',
      laborDescription: '',
      laborHours: '',
      demo: false,
      trim: false,
      paint: false
    };
    updateData({ workItems: [...(data.workItems || []), newItem] });
  };

  const addTask = () => {
    const newItem = {
      id: Date.now(),
      type: 'task',
      name: '',
      description: '',
      materialCost: '',
      laborCost: '',
      laborHours: '',
      disposal: false,
      delivery: false
    };
    updateData({ workItems: [...(data.workItems || []), newItem] });
  };

  const removeItem = (id) => {
    updateData({ workItems: data.workItems.filter(item => item.id !== id) });
  };

  const updateItem = (id, field, value) => {
    const updatedItems = data.workItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    updateData({ workItems: updatedItems });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.workItems || data.workItems.length === 0) {
      alert('Please add at least one room or task');
      return;
    }
    onNext();
  };

  const rooms = (data.workItems || []).filter(item => item.type === 'room');
  const tasks = (data.workItems || []).filter(item => item.type === 'task');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-800/50 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
            <Home className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-heading text-white">Work Items</h2>
            <p className="text-slate-400 text-sm">
              {rooms.length} room{rooms.length !== 1 ? 's' : ''}, {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Import Cart Button */}
        <motion.button
          type="button"
          onClick={() => setShowCartImport(true)}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 bg-gradient-to-r from-accent to-orange-500 hover:from-accent/90 hover:to-orange-500/90 text-white shadow-lg shadow-accent/20"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Import Cart</span>
        </motion.button>
      </div>

      {/* Tab Selector */}
      <div className="flex space-x-2 mb-6 bg-slate-800/50 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab('rooms')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
            activeTab === 'rooms'
              ? 'bg-primary text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="font-medium">Room-Based</span>
          {rooms.length > 0 && (
            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">
              {rooms.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all ${
            activeTab === 'tasks'
              ? 'bg-accent text-white shadow-lg'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span className="font-medium">Task-Based</span>
          {tasks.length > 0 && (
            <span className="bg-accent/20 text-accent px-2 py-0.5 rounded-full text-xs">
              {tasks.length}
            </span>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Room-Based Tab */}
        {activeTab === 'rooms' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-slate-300 text-sm">
                For remodels, painting, flooring - priced per square foot
              </p>
              <motion.button
                type="button"
                onClick={addRoom}
                className="flex items-center space-x-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary rounded-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Add Room</span>
              </motion.button>
            </div>

            {rooms.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <Home className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No rooms added yet</p>
                <p className="text-slate-500 text-sm">Click "Add Room" to get started</p>
              </div>
            ) : (
              rooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                      <Home className="w-5 h-5 text-primary" />
                      <span>Room {index + 1}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeItem(room.id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Room Name *
                      </label>
                      <input
                        type="text"
                        value={room.name}
                        onChange={(e) => updateItem(room.id, 'name', e.target.value)}
                        placeholder="e.g., Main Kitchen"
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Square Footage *
                      </label>
                      <div className="relative">
                        <Square className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="number"
                          value={room.sqft || ''}
                          onChange={(e) => updateItem(room.id, 'sqft', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          min="0"
                          step="0.1"
                          className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Material Cost/Sqft *
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="number"
                          value={room.materialCost || ''}
                          onChange={(e) => updateItem(room.id, 'materialCost', e.target.value)}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Labor Hours *
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="number"
                          value={room.laborHours || ''}
                          onChange={(e) => updateItem(room.id, 'laborHours', e.target.value)}
                          placeholder="0"
                          min="0"
                          step="0.5"
                          className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Add-Ons
                      </label>
                      <div className="flex flex-wrap gap-3">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={room.demo}
                            onChange={(e) => updateItem(room.id, 'demo', e.target.checked)}
                            className="w-4 h-4 rounded bg-slate-900 border-slate-600 text-primary"
                          />
                          <span className="text-slate-300 text-sm">Demo (+$0.50/sqft)</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={room.trim}
                            onChange={(e) => updateItem(room.id, 'trim', e.target.checked)}
                            className="w-4 h-4 rounded bg-slate-900 border-slate-600 text-primary"
                          />
                          <span className="text-slate-300 text-sm">Trim (+$0.75/sqft)</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={room.paint}
                            onChange={(e) => updateItem(room.id, 'paint', e.target.checked)}
                            className="w-4 h-4 rounded bg-slate-900 border-slate-600 text-primary"
                          />
                          <span className="text-slate-300 text-sm">Paint (+$1.00/sqft)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Task-Based Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-slate-300 text-sm">
                For specific jobs like install toilet, hang door - flat rate pricing
              </p>
              <motion.button
                type="button"
                onClick={addTask}
                className="flex items-center space-x-2 px-4 py-2 bg-accent/20 hover:bg-accent/30 border border-accent/30 text-accent rounded-xl transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Add Task</span>
              </motion.button>
            </div>

            {tasks.length === 0 ? (
              <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700/50">
                <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No tasks added yet</p>
                <p className="text-slate-500 text-sm">Click "Add Task" to get started</p>
              </div>
            ) : (
              tasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                      <CheckSquare className="w-5 h-5 text-accent" />
                      <span>Task {index + 1}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => removeItem(task.id)}
                      className="text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Task Name *
                      </label>
                      <input
                        type="text"
                        value={task.name}
                        onChange={(e) => updateItem(task.id, 'name', e.target.value)}
                        placeholder="e.g., Install Toilet"
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Task Description
                      </label>
                      <textarea
                        value={task.description || ''}
                        onChange={(e) => updateItem(task.id, 'description', e.target.value)}
                        placeholder="Describe the work to be done..."
                        rows={2}
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
                      />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Material Cost *
                        </label>
                        <div className="relative">
                          <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="number"
                            value={task.materialCost || ''}
                            onChange={(e) => updateItem(task.id, 'materialCost', e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Labor Cost *
                        </label>
                        <div className="relative">
                          <Hammer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="number"
                            value={task.laborCost || ''}
                            onChange={(e) => updateItem(task.id, 'laborCost', e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Labor Hours (Optional)
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type="number"
                            value={task.laborHours || ''}
                            onChange={(e) => updateItem(task.id, 'laborHours', e.target.value)}
                            placeholder="0"
                            min="0"
                            step="0.5"
                            className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Add-Ons
                      </label>
                      <div className="flex flex-wrap gap-3">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={task.disposal}
                            onChange={(e) => updateItem(task.id, 'disposal', e.target.checked)}
                            className="w-4 h-4 rounded bg-slate-900 border-slate-600 text-accent"
                          />
                          <span className="text-slate-300 text-sm">Disposal (+$25)</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={task.delivery}
                            onChange={(e) => updateItem(task.id, 'delivery', e.target.checked)}
                            className="w-4 h-4 rounded bg-slate-900 border-slate-600 text-accent"
                          />
                          <span className="text-slate-300 text-sm">Delivery (+$40)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t border-slate-800">
          <motion.button
            type="button"
            onClick={onBack}
            className="flex items-center space-x-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </motion.button>

          <motion.button
            type="submit"
            className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>Continue to Review</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </form>

      {/* Cart Import Flow Modal */}
      <AnimatePresence>
        {showCartImport && (
          <CartImportFlow
            onImport={handleCartImport}
            onClose={() => setShowCartImport(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

