import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Edit2, ArrowRight, ArrowLeft, User, Home, DollarSign } from 'lucide-react';

export default function ReviewNotesStep({ data, updateData, onNext, onBack }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  const calculateItemTotal = (item) => {
    if (item.type === 'room') {
      const materialTotal = (item.sqft || 0) * (parseFloat(item.materialCost) || 0);
      const laborTotal = (parseFloat(item.laborHours) || 0) * 75;
      const addOns = (item.demo ? item.sqft * 0.50 : 0) +
                     (item.trim ? item.sqft * 0.75 : 0) +
                     (item.paint ? item.sqft * 1.00 : 0);
      return materialTotal + laborTotal + addOns;
    } else if (item.type === 'task') {
      const materialCost = parseFloat(item.materialCost) || 0;
      const laborCost = parseFloat(item.laborCost) || 0;
      const addOns = (item.disposal ? 25 : 0) + (item.delivery ? 40 : 0);
      return materialCost + laborCost + addOns;
    }
    return 0;
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
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
          <FileText className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h2 className="text-2xl font-heading text-white">Review & Notes</h2>
          <p className="text-slate-400 text-sm">Final review before generating estimate</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client Info Review */}
        <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-white">Client Information</h3>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-400">Name:</span>
              <span className="ml-2 text-white">{data.clientName}</span>
            </div>
            <div>
              <span className="text-slate-400">Job Type:</span>
              <span className="ml-2 text-white">{data.jobType}</span>
            </div>
            {data.email && (
              <div>
                <span className="text-slate-400">Email:</span>
                <span className="ml-2 text-white">{data.email}</span>
              </div>
            )}
            {data.phone && (
              <div>
                <span className="text-slate-400">Phone:</span>
                <span className="ml-2 text-white">{data.phone}</span>
              </div>
            )}
            {data.address && (
              <div className="md:col-span-2">
                <span className="text-slate-400">Address:</span>
                <span className="ml-2 text-white">{data.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Work Items Review */}
        <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-4">
            <Home className="w-5 h-5 text-accent" />
            <h3 className="text-lg font-semibold text-white">
              Work Items ({rooms.length} room{rooms.length !== 1 ? 's' : ''}, {tasks.length} task{tasks.length !== 1 ? 's' : ''})
            </h3>
          </div>

          <div className="space-y-4">
            {/* Rooms */}
            {rooms.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-3">Room-Based Items</h4>
                <div className="space-y-3">
                  {rooms.map((room) => (
                    <div key={room.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h5 className="text-white font-medium">{room.name}</h5>
                          <p className="text-xs text-slate-400">{room.sqft} sqft</p>
                        </div>
                        <div className="text-right">
                          <p className="text-primary font-semibold">${calculateItemTotal(room).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mt-2 pt-2 border-t border-slate-700">
                        <div>Materials: ${((room.sqft || 0) * (parseFloat(room.materialCost) || 0)).toFixed(2)}</div>
                        <div>Labor: ${((parseFloat(room.laborHours) || 0) * 75).toFixed(2)}</div>
                      </div>
                      {(room.demo || room.trim || room.paint) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {room.demo && <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">Demo</span>}
                          {room.trim && <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">Trim</span>}
                          {room.paint && <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">Paint</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks */}
            {tasks.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-slate-400 mb-3">Task-Based Items</h4>
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h5 className="text-white font-medium">{task.name}</h5>
                          {task.description && <p className="text-xs text-slate-400">{task.description}</p>}
                        </div>
                        <div className="text-right">
                          <p className="text-accent font-semibold">${calculateItemTotal(task).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mt-2 pt-2 border-t border-slate-700">
                        <div>Materials: ${(parseFloat(task.materialCost) || 0).toFixed(2)}</div>
                        <div>Labor: ${(parseFloat(task.laborCost) || 0).toFixed(2)}</div>
                      </div>
                      {(task.disposal || task.delivery) && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {task.disposal && <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">Disposal</span>}
                          {task.delivery && <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">Delivery</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Markup */}
        <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Markup</h3>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Markup Percentage
            </label>
            <div className="relative max-w-xs">
              <input
                type="number"
                value={data.markup}
                onChange={(e) => updateData({ markup: parseFloat(e.target.value) || 0 })}
                min="0"
                max="100"
                step="1"
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
          <div className="flex items-center space-x-2 mb-4">
            <Edit2 className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">Additional Notes</h3>
          </div>
          <textarea
            value={data.notes}
            onChange={(e) => updateData({ notes: e.target.value })}
            placeholder="Add any special notes, terms, or conditions..."
            rows={4}
            className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
          />
        </div>

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
            <span>Continue to Summary</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}

