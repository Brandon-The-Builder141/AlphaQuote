import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  Database,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  X
} from 'lucide-react';

const DataImportStep = ({ data, onDataChange, onNext, onBack }) => {
  const [importData, setImportData] = useState(data.importData || {
    hasData: false,
    file: null,
    filePreview: null,
    importType: 'csv',
    skipImport: false
  });

  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    onDataChange({ importData });
  }, [importData, onDataChange]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file && (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel' || file.name.endsWith('.csv') || file.name.endsWith('.xlsx'))) {
      setImportData(prev => ({
        ...prev,
        file,
        hasData: true,
        skipImport: false
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImportData(prev => ({
          ...prev,
          filePreview: e.target.result
        }));
      };
      reader.readAsText(file);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleSkip = () => {
    setImportData(prev => ({
      ...prev,
      skipImport: true,
      hasData: false,
      file: null,
      filePreview: null
    }));
  };

  const handleNext = () => {
    onNext();
  };

  const removeFile = () => {
    setImportData(prev => ({
      ...prev,
      file: null,
      filePreview: null,
      hasData: false
    }));
  };

  return (
    <motion.div
      className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-800/50 shadow-xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <motion.div
          className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Upload className="w-8 h-8 text-primary" />
        </motion.div>
        <h2 className="text-3xl font-heading text-white mb-2">Import Your Data</h2>
        <p className="text-slate-300 font-body">Upload existing data or skip this step for now</p>
      </div>

      <div className="space-y-6">
        {/* File Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
            dragActive
              ? 'border-primary bg-primary/10'
              : importData.hasData
                ? 'border-green-500 bg-green-500/10'
                : 'border-slate-600 hover:border-slate-500'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <motion.div
              className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4"
              animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
            >
              <Upload className="w-8 h-8 text-slate-400" />
            </motion.div>

            <h3 className="text-xl font-heading text-white mb-2">
              {importData.hasData ? 'File Ready for Import' : 'Drop your file here'}
            </h3>
            <p className="text-slate-300 font-body mb-4">
              {importData.hasData
                ? 'Your data file is ready to be imported'
                : 'Upload CSV or Excel files with your existing data'
              }
            </p>

            {!importData.hasData && (
              <div className="space-y-4">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 text-white rounded-xl font-body transition-all duration-200 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  Choose File
                </label>
                <p className="text-sm text-slate-400 font-body">
                  Supported formats: CSV, Excel (.xlsx, .xls)
                </p>
              </div>
            )}

            {importData.hasData && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-body">{importData.file.name}</span>
                </div>
                <button
                  onClick={removeFile}
                  className="text-red-400 hover:text-red-300 text-sm font-body flex items-center gap-1 mx-auto"
                >
                  <X className="w-4 h-4" />
                  Remove File
                </button>
              </div>
            )}
          </div>
        </div>

        {/* File Preview */}
        {importData.hasData && importData.filePreview && (
          <motion.div
            className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h4 className="text-lg font-heading text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              File Preview
            </h4>
            <div className="bg-slate-900/50 rounded-lg p-4 max-h-40 overflow-auto">
              <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap">
                {importData.filePreview.substring(0, 500)}
                {importData.filePreview.length > 500 && '...'}
              </pre>
            </div>
          </motion.div>
        )}

        {/* Import Options */}
        {importData.hasData && (
          <motion.div
            className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h4 className="text-lg font-heading text-white mb-4">Import Options</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="csv"
                  name="importType"
                  value="csv"
                  checked={importData.importType === 'csv'}
                  onChange={(e) => setImportData(prev => ({ ...prev, importType: e.target.value }))}
                  className="w-4 h-4 text-primary bg-slate-800 border-slate-600 focus:ring-primary"
                />
                <label htmlFor="csv" className="text-slate-300 font-body">CSV Format</label>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  id="excel"
                  name="importType"
                  value="excel"
                  checked={importData.importType === 'excel'}
                  onChange={(e) => setImportData(prev => ({ ...prev, importType: e.target.value }))}
                  className="w-4 h-4 text-primary bg-slate-800 border-slate-600 focus:ring-primary"
                />
                <label htmlFor="excel" className="text-slate-300 font-body">Excel Format</label>
              </div>
            </div>
          </motion.div>
        )}

        {/* Skip Option */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={handleSkip}
            className="text-slate-400 hover:text-white transition-colors duration-200 font-body"
          >
            Skip for now - I'll add data later
          </button>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8 pt-6 border-t border-slate-700/50">
        <motion.button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl font-body transition-all duration-200 border border-slate-600/50 hover:border-slate-500"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>

        <motion.button
          onClick={handleNext}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white rounded-xl font-body transition-all duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default DataImportStep;
