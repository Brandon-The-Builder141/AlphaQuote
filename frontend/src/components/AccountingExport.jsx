/**
 * Accounting Export Component
 * Provides UI for exporting data to accounting software
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  FileText,
  Calculator,
  Receipt,
  Building2,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Info
} from 'lucide-react';
import accountingExportService from '../services/accountingExportService';

const AccountingExport = ({
  data,
  dataType = 'quote',
  title = 'Export to Accounting Software',
  className = ''
}) => {
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);
  const [showFormatInfo, setShowFormatInfo] = useState(false);

  const supportedFormats = accountingExportService.getSupportedFormats();

  const handleExport = async () => {
    setIsExporting(true);
    setExportResult(null);

    try {
      let result;

      switch (dataType) {
        case 'quote':
          result = await accountingExportService.exportQuote(data, selectedFormat);
          break;
        case 'receipts':
          result = await accountingExportService.exportReceipts(data, selectedFormat);
          break;
        case 'projects':
          result = await accountingExportService.exportProjects(data, selectedFormat);
          break;
        default:
          throw new Error(`Unsupported data type: ${dataType}`);
      }

      if (result.success) {
        // Download the file
        accountingExportService.downloadExport(
          result.data,
          result.filename,
          selectedFormat
        );
      }

      setExportResult(result);
    } catch (error) {
      setExportResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getDataTypeIcon = () => {
    switch (dataType) {
      case 'quote':
        return Calculator;
      case 'receipts':
        return Receipt;
      case 'projects':
        return Building2;
      default:
        return FileText;
    }
  };

  const getDataTypeLabel = () => {
    switch (dataType) {
      case 'quote':
        return 'Quote';
      case 'receipts':
        return 'Receipts';
      case 'projects':
        return 'Projects';
      default:
        return 'Data';
    }
  };

  const DataIcon = getDataTypeIcon();

  const formatInfo = {
    quickbooks: {
      description: 'QuickBooks Desktop/Online compatible format',
      features: ['Customer mapping', 'Item tracking', 'Tax calculations', 'Invoice ready'],
      color: 'text-blue-400'
    },
    housecallpro: {
      description: 'Housecall Pro service management format',
      features: ['Job tracking', 'Customer management', 'Service scheduling', 'Material tracking'],
      color: 'text-green-400'
    },
    xero: {
      description: 'Xero cloud accounting format',
      features: ['Contact management', 'Invoice generation', 'Expense tracking', 'Multi-currency'],
      color: 'text-purple-400'
    },
    csv: {
      description: 'Generic CSV format for any accounting software',
      features: ['Universal compatibility', 'Easy import', 'Customizable mapping', 'All data included'],
      color: 'text-gray-400'
    }
  };

  return (
    <div className={`bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <DataIcon className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-semibold text-white">{title}</h3>
        </div>
        <button
          onClick={() => setShowFormatInfo(!showFormatInfo)}
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Format Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-300 mb-3">
          Export Format
        </label>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(supportedFormats).map(([key, label]) => (
            <motion.button
              key={key}
              onClick={() => setSelectedFormat(key)}
              className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                selectedFormat === key
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-sm font-medium">{label}</div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Format Information */}
      <AnimatePresence>
        {showFormatInfo && (
          <motion.div
            className="mb-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${formatInfo[selectedFormat].color.replace('text-', 'bg-')}`} />
              <div>
                <h4 className={`font-medium mb-2 ${formatInfo[selectedFormat].color}`}>
                  {supportedFormats[selectedFormat]}
                </h4>
                <p className="text-sm text-slate-300 mb-3">
                  {formatInfo[selectedFormat].description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {formatInfo[selectedFormat].features.map((feature, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-slate-700/50 text-xs text-slate-300 rounded-lg"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Button */}
      <motion.button
        onClick={handleExport}
        disabled={isExporting || !data}
        className={`w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
          isExporting || !data
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
            : 'bg-primary hover:bg-primary/80 text-white shadow-lg shadow-primary/25 hover:shadow-primary/40'
        }`}
        whileHover={!isExporting && data ? { scale: 1.02 } : {}}
        whileTap={!isExporting && data ? { scale: 0.98 } : {}}
      >
        {isExporting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            <span>Export {getDataTypeLabel()}</span>
          </>
        )}
      </motion.button>

      {/* Export Result */}
      <AnimatePresence>
        {exportResult && (
          <motion.div
            className={`mt-4 p-4 rounded-xl border ${
              exportResult.success
                ? 'bg-green-900/20 border-green-500/30'
                : 'bg-red-900/20 border-red-500/30'
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start gap-3">
              {exportResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
              )}
              <div>
                <p className={`font-medium ${
                  exportResult.success ? 'text-green-400' : 'text-red-400'
                }`}>
                  {exportResult.success ? 'Export Successful' : 'Export Failed'}
                </p>
                <p className="text-sm text-slate-300 mt-1">
                  {exportResult.success ? exportResult.message : exportResult.error}
                </p>
                {exportResult.success && (
                  <div className="flex items-center gap-2 mt-2">
                    <ExternalLink className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-slate-400">
                      File downloaded: {exportResult.filename}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Preview */}
      {data && (
        <div className="mt-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
          <h4 className="text-sm font-medium text-slate-300 mb-2">Export Preview</h4>
          <div className="text-xs text-slate-400 space-y-1">
            <div>Data Type: {getDataTypeLabel()}</div>
            <div>Items: {Array.isArray(data) ? data.length : 1}</div>
            <div>Format: {supportedFormats[selectedFormat]}</div>
            {dataType === 'quote' && data.total && (
              <div>Total: ${parseFloat(data.total).toFixed(2)}</div>
            )}
            {dataType === 'receipts' && Array.isArray(data) && (
              <div>Total Receipts: {data.length}</div>
            )}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-300">
            <p className="font-medium mb-1">Export Instructions:</p>
            <ul className="space-y-1 text-blue-200">
              <li>• Choose your accounting software format</li>
              <li>• Click Export to download the file</li>
              <li>• Import the file into your accounting software</li>
              <li>• Map fields as needed in your software</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountingExport;
