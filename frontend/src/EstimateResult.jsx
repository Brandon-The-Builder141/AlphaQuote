import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  FileText,
  CheckCircle,
  DollarSign,
  Loader
} from 'lucide-react';
import ExportButton from './components/ExportButton';
import ProFeatureGate from './components/ProFeatureGate';
import { generateQuotePDF } from './utils/pdfService';
import { showSuccess, showError } from './utils/toastService';

export default function EstimateResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Get data from navigation state, with fallbacks
  const estimateData = location.state || {};
  const {
    projectInfo,
    workItems,
    rooms,
    markup,
    estimateType,
    notes,
    subtotal,
    markupAmount,
    taxAmount,
    taxEnabled,
    taxRate,
    discount,
    total,
    // Legacy fields for backward compatibility
    roomType,
    sqft,
    materialType,
    laborType,
    totalEstimate,
    breakdown
  } = estimateData;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleDownloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);

      // Prepare quote data for PDF
      const quoteData = {
        projectInfo,
        workItems,
        rooms,
        markup,
        taxEnabled,
        taxRate,
        discount,
        subtotal,
        markupAmount,
        taxAmount,
        total,
        notes,
        estimateType
      };

      // Generate and download PDF using @react-pdf/renderer
      await generateQuotePDF(quoteData, (status) => {
        console.log('PDF Generation:', status);
      });

      showSuccess('PDF downloaded successfully!');
    } catch (error) {
      console.error('PDF generation failed:', error);
      showError('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // If no data is available, show a message
  if (!location.state) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-neon-blue mb-4">No Estimate Data</h1>
          <p className="text-gray-300 mb-6">Please generate an estimate first.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-neon-blue hover:bg-blue-500 text-white px-6 py-3 rounded-lg transition-all duration-300"
          >
            Start New Estimate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white font-body overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Blueprint Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] animate-pulse"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'10\' height=\'10\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 10 0 L 0 0 0 10\' fill=\'none\' stroke=\'%2314B8A6\' stroke-width=\'0.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100\' height=\'100\' fill=\'url(%23grid)\'/%3E%3C/svg%3E")'
          }}
        ></div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.8, 0.2]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto py-12 px-8">
        {/* Premium Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full mb-6"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <CheckCircle className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-5xl font-heading text-white mb-4">
            Estimate Complete
          </h1>
          <p className="text-xl text-slate-300">Your AlphaQuote estimate is ready</p>
        </motion.div>

        {/* Estimate Summary Card */}
        <motion.div
          className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-800/50 shadow-xl hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          whileHover={{ y: -4 }}
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-heading text-white">Estimate Summary</h2>
          </div>

          {/* Client/Project Details */}
          {projectInfo && (
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Project Information</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Client:</span>
                  <span className="ml-2 text-white font-medium">{projectInfo.clientName}</span>
                </div>
                <div>
                  <span className="text-slate-400">Job Type:</span>
                  <span className="ml-2 text-white font-medium">{projectInfo.jobType}</span>
                </div>
                {projectInfo.email && (
                  <div>
                    <span className="text-slate-400">Email:</span>
                    <span className="ml-2 text-white font-medium">{projectInfo.email}</span>
                  </div>
                )}
                {projectInfo.phone && (
                  <div>
                    <span className="text-slate-400">Phone:</span>
                    <span className="ml-2 text-white font-medium">{projectInfo.phone}</span>
                  </div>
                )}
                {projectInfo.address && (
                  <div className="md:col-span-2">
                    <span className="text-slate-400">Address:</span>
                    <span className="ml-2 text-white font-medium">{projectInfo.address}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400">Date:</span>
                  <span className="ml-2 text-white font-medium">{projectInfo.date || new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Work Items Breakdown */}
          {workItems && workItems.length > 0 && (
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Work Items</h3>
              <div className="space-y-4">
                {workItems.filter(item => item.type === 'room').length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-primary mb-3">Room-Based Items</h4>
                    <div className="space-y-2">
                      {workItems.filter(item => item.type === 'room').map((room) => (
                        <div key={room.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="text-white font-medium">{room.name}</h5>
                              <p className="text-xs text-slate-400">{room.sqft} sqft × ${room.materialCost}/sqft</p>
                              <p className="text-xs text-slate-400">{room.laborHours} hrs labor</p>
                            </div>
                            <div className="text-right">
                              <p className="text-primary font-semibold">
                                ${((parseFloat(room.sqft) || 0) * (parseFloat(room.materialCost) || 0) + (parseFloat(room.laborHours) || 0) * 75 + ((room.demo ? room.sqft * 0.50 : 0) + (room.trim ? room.sqft * 0.75 : 0) + (room.paint ? room.sqft * 1.00 : 0))).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          {(room.demo || room.trim || room.paint) && (
                            <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-700">
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

                {workItems.filter(item => item.type === 'task').length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-accent mb-3">Task-Based Items</h4>
                    <div className="space-y-2">
                      {workItems.filter(item => item.type === 'task').map((task) => (
                        <div key={task.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="text-white font-medium">{task.name}</h5>
                              {task.description && <p className="text-xs text-slate-400">{task.description}</p>}
                              <p className="text-xs text-slate-400 mt-1">
                                Materials: ${task.materialCost} + Labor: ${task.laborCost}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-accent font-semibold">
                                ${((parseFloat(task.materialCost) || 0) + (parseFloat(task.laborCost) || 0) + (task.disposal ? 25 : 0) + (task.delivery ? 40 : 0)).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          {(task.disposal || task.delivery) && (
                            <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-700">
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
          )}

          {/* Legacy room display for old estimates */}
          {!workItems && rooms && rooms.length > 0 && (
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Rooms</h3>
              <div className="space-y-2">
                {rooms.map((room, index) => (
                  <div key={index} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                    <div className="flex justify-between">
                      <span className="text-white">{room.name}</span>
                      <span className="text-primary font-medium">{room.sqft} sqft</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cost Breakdown */}
          <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Cost Breakdown</h3>
            <div className="space-y-3">
              {subtotal && (
                <div className="flex justify-between py-2">
                  <span className="text-slate-300">Subtotal</span>
                  <span className="text-white font-semibold">{formatCurrency(parseFloat(subtotal))}</span>
                </div>
              )}
              {markupAmount && (
                <div className="flex justify-between py-2 border-t border-slate-700">
                  <span className="text-slate-300">Markup ({markup}%)</span>
                  <span className="text-primary font-semibold">{formatCurrency(parseFloat(markupAmount))}</span>
                </div>
              )}
              {taxEnabled && taxAmount && (
                <div className="flex justify-between py-2 border-t border-slate-700">
                  <span className="text-slate-300">Tax ({taxRate}%)</span>
                  <span className="text-green-400 font-semibold">{formatCurrency(parseFloat(taxAmount))}</span>
                </div>
              )}
              {discount > 0 && (
                <div className="flex justify-between py-2 border-t border-slate-700">
                  <span className="text-slate-300">Discount</span>
                  <span className="text-red-400 font-semibold">-{formatCurrency(parseFloat(discount))}</span>
                </div>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          {notes && (
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Additional Notes</h3>
              <p className="text-slate-300 whitespace-pre-wrap">{notes}</p>
            </div>
          )}

          {/* Total Estimate */}
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 text-center mb-8 shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-4">
              <DollarSign className="w-8 h-8 text-white" />
              <h3 className="text-xl font-heading text-white">Total Estimate</h3>
            </div>
            <p className="text-5xl font-bold text-white">
              {formatCurrency(parseFloat(total || subtotal || totalEstimate || 0))}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6">
            <ProFeatureGate
              feature="PDF export with custom branding"
              className="flex-1"
            >
              <motion.button
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="group relative bg-gradient-to-r from-primary to-primary/80 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-3 overflow-hidden w-full disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isGeneratingPDF ? 1 : 1.05, y: isGeneratingPDF ? 0 : -2 }}
                whileTap={{ scale: isGeneratingPDF ? 1 : 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                {isGeneratingPDF ? (
                  <>
                    <Loader className="w-6 h-6 relative z-10 animate-spin" />
                    <span className="relative z-10">Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-6 h-6 relative z-10" />
                    <span className="relative z-10">Download as PDF</span>
                  </>
                )}
              </motion.button>
            </ProFeatureGate>

            <ProFeatureGate
              feature="Data export to accounting software"
              className="flex-1"
            >
              <ExportButton
                data={{
                  id: `quote_${Date.now()}`,
                  clientName: projectInfo?.clientName || 'Client Name',
                  clientEmail: projectInfo?.email || 'client@example.com',
                  address: projectInfo?.address || 'Project Address',
                  jobType: projectInfo?.jobType || 'Construction Project',
                  description: notes || 'Project Description',
                  createdAt: new Date().toISOString(),
                  subtotal: parseFloat(subtotal || totalEstimate || 0),
                  markup: markup || 15,
                  total: parseFloat(total || totalEstimate || 0),
                  rooms: rooms || [],
                  workItems: workItems || [],
                  changeOrders: []
                }}
                dataType="quote"
                label="Export to Accounting"
                size="large"
                variant="secondary"
                className="w-full"
              />
            </ProFeatureGate>

            <motion.button
              onClick={() => navigate('/')}
              className="group relative bg-gradient-to-r from-accent to-accent/80 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 flex items-center justify-center space-x-3 overflow-hidden flex-1"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              <ArrowLeft className="w-6 h-6 relative z-10" />
              <span className="relative z-10">Start New Estimate</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-slate-400 text-sm">
            Thank you for using AlphaQuote! 🧮
          </p>
        </motion.div>
      </div>
    </div>
  );
}
