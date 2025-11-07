import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calculator, DollarSign, ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import { calculateCompleteEstimate, calculateWorkItemCost } from '../../utils/calculateEstimate';

export default function EstimateSummaryStep({ data, updateData, onBack }) {
  const navigate = useNavigate();

  const calculateItemCost = (item) => {
    return calculateWorkItemCost(item);
  };

  const rooms = (data.workItems || []).filter(item => item.type === 'room');
  const tasks = (data.workItems || []).filter(item => item.type === 'task');

  // Calculate totals using deterministic function
  const estimate = calculateCompleteEstimate({
    workItems: data.workItems || [],
    markup: data.markup || 15,
    taxRate: data.taxRate || 0,
    taxEnabled: data.taxEnabled || false,
    discount: data.discount || 0
  });

  // Update parent data when calculations change
  useEffect(() => {
    updateData({
      subtotal: estimate.subtotal,
      markupAmount: estimate.markupAmount,
      taxAmount: estimate.taxAmount,
      total: estimate.total
    });
  }, [data.workItems, data.markup, data.taxRate, data.taxEnabled, data.discount]);

  const handleGenerateEstimate = () => {
    // Convert wizard data to format expected by EstimateResult
    const estimateData = {
      projectInfo: {
        clientName: data.clientName,
        jobType: data.jobType,
        email: data.email,
        phone: data.phone,
        address: data.address,
        date: new Date().toLocaleDateString()
      },
      workItems: data.workItems,
      rooms, // For backward compatibility
      markup: data.markup,
      taxEnabled: data.taxEnabled,
      taxRate: data.taxRate,
      discount: data.discount,
      estimateType: 'New Estimate',
      notes: data.notes,
      subtotal: estimate.subtotal,
      markupAmount: estimate.markupAmount,
      taxAmount: estimate.taxAmount,
      total: estimate.total
    };

    // Navigate to result page with estimate data
    navigate('/result', { state: estimateData });
  };

  const subtotal = estimate.subtotalNum;
  const markupAmount = estimate.markupAmountNum;
  const total = estimate.totalNum;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-800/50 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
          <Calculator className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-heading text-white">Estimate Summary</h2>
          <p className="text-slate-400 text-sm">Your estimate is ready to generate</p>
        </div>
      </div>

      {/* Success Indicator */}
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 flex items-center space-x-3">
        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
        <p className="text-green-300 text-sm">
          All information collected successfully. Review the summary below and generate your estimate.
        </p>
      </div>

      {/* Project Overview */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Project Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-300 text-sm">Client:</span>
              <span className="text-white font-medium text-sm">{data.clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-300 text-sm">Job Type:</span>
              <span className="text-white font-medium text-sm">{data.jobType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Rooms:</span>
              <span className="text-white font-medium text-sm">{rooms.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Tasks:</span>
              <span className="text-white font-medium text-sm">{tasks.length}</span>
            </div>
            {rooms.length > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-300 text-sm">Total Sqft:</span>
                <span className="text-white font-medium text-sm">
                  {rooms.reduce((sum, room) => sum + (parseFloat(room.sqft) || 0), 0).toFixed(0)} sqft
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Work Items Breakdown</h3>
          <div className="space-y-3 max-h-40 overflow-y-auto">
            {rooms.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Room-Based:</p>
                {rooms.map((room) => (
                  <div key={room.id} className="flex justify-between text-sm">
                    <span className="text-slate-300">{room.name}</span>
                    <span className="text-primary font-medium">${calculateItemCost(room).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            {tasks.length > 0 && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Task-Based:</p>
                {tasks.map((task) => (
                  <div key={task.id} className="flex justify-between text-sm">
                    <span className="text-slate-300">{task.name}</span>
                    <span className="text-accent font-medium">${calculateItemCost(task).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-xl p-6 border border-slate-700/50 mb-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <span>Cost Breakdown</span>
        </h3>

        <div className="space-y-3">
          {/* Subtotal */}
          <div className="flex justify-between items-center py-2">
            <span className="text-slate-300">Subtotal (Materials + Labor + Add-ons)</span>
            <span className="text-xl font-semibold text-white">${estimate.subtotal}</span>
          </div>

          {/* Markup */}
          <div className="flex justify-between items-center py-2 border-t border-slate-700">
            <span className="text-slate-300">Markup ({data.markup}%)</span>
            <span className="text-xl font-semibold text-primary">${estimate.markupAmount}</span>
          </div>

          {/* Tax (if enabled) */}
          {data.taxEnabled && (
            <div className="flex justify-between items-center py-2 border-t border-slate-700">
              <span className="text-slate-300">Tax ({data.taxRate}%)</span>
              <span className="text-xl font-semibold text-green-400">${estimate.taxAmount}</span>
            </div>
          )}

          {/* Discount (if any) */}
          {data.discount > 0 && (
            <div className="flex justify-between items-center py-2 border-t border-slate-700">
              <span className="text-slate-300">Discount</span>
              <span className="text-xl font-semibold text-red-400">-${estimate.discount}</span>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center py-3 border-t-2 border-primary/30 bg-primary/5 rounded-lg px-4">
            <span className="text-white font-semibold text-lg">Total Estimate</span>
            <span className="text-3xl font-bold text-primary">${estimate.total}</span>
          </div>
        </div>
      </div>

      {/* Additional Notes Preview */}
      {data.notes && (
        <div className="bg-slate-800/30 rounded-xl p-5 border border-slate-700/50 mb-6">
          <h3 className="text-sm font-medium text-slate-400 mb-2">Additional Notes</h3>
          <p className="text-slate-300 text-sm whitespace-pre-wrap">{data.notes}</p>
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
          <span>Back to Review</span>
        </motion.button>

        <motion.button
          onClick={handleGenerateEstimate}
          className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary via-accent to-primary text-white rounded-xl font-bold text-lg shadow-2xl shadow-primary/50 hover:shadow-primary/70 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <FileText className="w-6 h-6" />
          <span>Generate Estimate</span>
        </motion.button>
      </div>
    </motion.div>
  );
}

