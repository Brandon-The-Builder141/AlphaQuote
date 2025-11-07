/**
 * Export Button Component
 * Compact export button for integrating into existing pages
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import accountingExportService from '../services/accountingExportService';

const ExportButton = ({
  data,
  dataType = 'quote',
  label = 'Export',
  size = 'default',
  variant = 'primary',
  className = ''
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);

  const handleQuickExport = async () => {
    setIsExporting(true);
    setExportResult(null);

    try {
      let result;

      switch (dataType) {
        case 'quote':
          result = await accountingExportService.exportQuote(data, 'csv');
          break;
        case 'receipts':
          result = await accountingExportService.exportReceipts(data, 'csv');
          break;
        case 'projects':
          result = await accountingExportService.exportProjects(data, 'csv');
          break;
        default:
          throw new Error(`Unsupported data type: ${dataType}`);
      }

      if (result.success) {
        accountingExportService.downloadExport(
          result.data,
          result.filename,
          'csv'
        );
      }

      setExportResult(result);

      // Auto-hide success message after 3 seconds
      if (result.success) {
        setTimeout(() => setExportResult(null), 3000);
      }
    } catch (error) {
      setExportResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'px-3 py-1.5 text-sm';
      case 'large':
        return 'px-6 py-3 text-lg';
      default:
        return 'px-4 py-2 text-base';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white';
      case 'outline':
        return 'bg-transparent border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white';
      case 'ghost':
        return 'bg-transparent hover:bg-slate-700/50 text-slate-400 hover:text-white';
      default:
        return 'bg-primary hover:bg-primary/80 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40';
    }
  };

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={handleQuickExport}
        disabled={isExporting || !data}
        className={`flex items-center gap-2 rounded-lg font-medium transition-all duration-300 ${getSizeClasses()} ${getVariantClasses()} ${
          isExporting || !data ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        whileHover={!isExporting && data ? { scale: 1.05 } : {}}
        whileTap={!isExporting && data ? { scale: 0.95 } : {}}
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        <span>{isExporting ? 'Exporting...' : label}</span>
      </motion.button>

      {/* Export Result Toast */}
      <AnimatePresence>
        {exportResult && (
          <motion.div
            className="absolute top-full left-0 mt-2 w-64 p-3 rounded-lg shadow-lg z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className={`flex items-start gap-2 ${
              exportResult.success
                ? 'bg-green-900/95 border border-green-500/30'
                : 'bg-red-900/95 border border-red-500/30'
            } rounded-lg p-3`}>
              {exportResult.success ? (
                <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <p className={`text-sm font-medium ${
                  exportResult.success ? 'text-green-400' : 'text-red-400'
                }`}>
                  {exportResult.success ? 'Export Successful' : 'Export Failed'}
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  {exportResult.success ? 'File downloaded successfully' : exportResult.error}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportButton;
