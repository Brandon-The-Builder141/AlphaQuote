/**
 * Accounting Integration Page
 * Main page for managing accounting software integrations
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calculator,
  Receipt,
  Building2,
  Download,
  FileText,
  Settings,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import AccountingExport from '../components/AccountingExport';
import ExportButton from '../components/ExportButton';
import offlineWrapper from '../services/offlineWrapper';

const AccountingIntegration = () => {
  const [receipts, setReceipts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDataType, setSelectedDataType] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load receipts and projects data
      const [receiptsResult, projectsResult] = await Promise.all([
        offlineWrapper.getReceipts(),
        offlineWrapper.getProjects()
      ]);

      if (receiptsResult.success) {
        setReceipts(receiptsResult.receipts || []);
      }

      if (projectsResult.success) {
        setProjects(projectsResult.projects || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDataForExport = () => {
    switch (selectedDataType) {
      case 'receipts':
        return receipts;
      case 'projects':
        return projects;
      case 'all':
        return {
          receipts,
          projects,
          summary: {
            totalReceipts: receipts.length,
            totalProjects: projects.length,
            totalReceiptValue: receipts.reduce((sum, r) => sum + parseFloat(r.total || 0), 0)
          }
        };
      default:
        return [];
    }
  };

  const getSelectedDataTypeLabel = () => {
    switch (selectedDataType) {
      case 'receipts':
        return 'Receipts';
      case 'projects':
        return 'Projects';
      case 'all':
        return 'All Data';
      default:
        return 'Data';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white font-body">Loading accounting integration...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-4">
            Accounting Integration
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Export your quotes, receipts, and project data to popular accounting software like QuickBooks, Housecall Pro, and Xero.
          </p>
        </motion.div>

        {/* Data Overview */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Receipt className="w-8 h-8 text-blue-400" />
              <h3 className="text-xl font-semibold text-white">Receipts</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{receipts.length}</div>
            <div className="text-sm text-slate-400">
              Total value: ${receipts.reduce((sum, r) => sum + parseFloat(r.total || 0), 0).toFixed(2)}
            </div>
            <div className="mt-4">
              <ExportButton
                data={receipts}
                dataType="receipts"
                label="Export Receipts"
                size="small"
                variant="outline"
                className="w-full"
              />
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="w-8 h-8 text-green-400" />
              <h3 className="text-xl font-semibold text-white">Projects</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{projects.length}</div>
            <div className="text-sm text-slate-400">Active projects</div>
            <div className="mt-4">
              <ExportButton
                data={projects}
                dataType="projects"
                label="Export Projects"
                size="small"
                variant="outline"
                className="w-full"
              />
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">All Data</h3>
            </div>
            <div className="text-3xl font-bold text-white mb-2">{receipts.length + projects.length}</div>
            <div className="text-sm text-slate-400">Total items</div>
            <div className="mt-4">
              <ExportButton
                data={getDataForExport()}
                dataType="all"
                label="Export All"
                size="small"
                variant="primary"
                className="w-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Main Export Interface */}
        <motion.div
          className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-800/50 shadow-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
              <Download className="w-6 h-6 text-primary" />
              Export to Accounting Software
            </h2>
          </div>

          {/* Data Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              Select Data to Export
            </label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: 'receipts', label: 'Receipts', icon: Receipt, count: receipts.length },
                { key: 'projects', label: 'Projects', icon: Building2, count: projects.length },
                { key: 'all', label: 'All Data', icon: FileText, count: receipts.length + projects.length }
              ].map(({ key, label, icon: Icon, count }) => (
                <motion.button
                  key={key}
                  onClick={() => setSelectedDataType(key)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    selectedDataType === key
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </div>
                  <div className="text-2xl font-bold">{count}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Export Component */}
          <AccountingExport
            data={getDataForExport()}
            dataType={selectedDataType}
            title={`Export ${getSelectedDataTypeLabel()}`}
          />
        </motion.div>

        {/* Supported Software */}
        <motion.div
          className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-800/50 shadow-lg mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
            <Settings className="w-6 h-6 text-primary" />
            Supported Accounting Software
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'QuickBooks',
                description: 'Desktop & Online',
                features: ['Customer mapping', 'Item tracking', 'Tax calculations'],
                color: 'text-blue-400',
                bgColor: 'bg-blue-900/20',
                borderColor: 'border-blue-500/30'
              },
              {
                name: 'Housecall Pro',
                description: 'Service Management',
                features: ['Job tracking', 'Customer management', 'Scheduling'],
                color: 'text-green-400',
                bgColor: 'bg-green-900/20',
                borderColor: 'border-green-500/30'
              },
              {
                name: 'Xero',
                description: 'Cloud Accounting',
                features: ['Contact management', 'Invoice generation', 'Multi-currency'],
                color: 'text-purple-400',
                bgColor: 'bg-purple-900/20',
                borderColor: 'border-purple-500/30'
              },
              {
                name: 'CSV Export',
                description: 'Universal Format',
                features: ['Any software', 'Easy import', 'Customizable'],
                color: 'text-gray-400',
                bgColor: 'bg-gray-900/20',
                borderColor: 'border-gray-500/30'
              }
            ].map((software, index) => (
              <motion.div
                key={software.name}
                className={`p-6 rounded-xl border ${software.bgColor} ${software.borderColor}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
              >
                <h3 className={`text-xl font-semibold ${software.color} mb-2`}>
                  {software.name}
                </h3>
                <p className="text-sm text-slate-400 mb-4">{software.description}</p>
                <ul className="space-y-1">
                  {software.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Help & Instructions */}
        <motion.div
          className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-800/50 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
            <Info className="w-6 h-6 text-primary" />
            Export Instructions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">How to Export</h3>
              <ol className="space-y-3 text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">1</span>
                  <span>Select the data you want to export (receipts, projects, or all)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">2</span>
                  <span>Choose your accounting software format</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">3</span>
                  <span>Click Export to download the file</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold">4</span>
                  <span>Import the file into your accounting software</span>
                </li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Data Mapping</h3>
              <div className="space-y-3 text-slate-300">
                <div className="flex items-center gap-3">
                  <Calculator className="w-5 h-5 text-blue-400" />
                  <span>Quotes → Estimates/Proposals</span>
                </div>
                <div className="flex items-center gap-3">
                  <Receipt className="w-5 h-5 text-green-400" />
                  <span>Receipts → Expenses/Purchases</span>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="w-5 h-5 text-purple-400" />
                  <span>Projects → Jobs/Customers</span>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-orange-400" />
                  <span>Materials → Inventory Items</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-1">Important Notes:</p>
                <ul className="space-y-1 text-blue-200">
                  <li>• Export files are generated in CSV format for maximum compatibility</li>
                  <li>• Field mapping may need adjustment in your accounting software</li>
                  <li>• Always review imported data before finalizing</li>
                  <li>• Contact your accounting software support for import assistance</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AccountingIntegration;
