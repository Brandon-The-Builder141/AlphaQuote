/**
 * Offline Mode Component
 * Provides offline functionality UI and settings
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wifi,
  WifiOff,
  Cloud,
  Database,
  Settings,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import offlineService from '../services/offlineService';

const OfflineMode = () => {
  const [isOfflineEnabled, setIsOfflineEnabled] = useState(false);
  const [networkStatus, setNetworkStatus] = useState({ isOnline: true, syncInProgress: false });
  const [syncStats, setSyncStats] = useState({ pending: 0, synced: 0, errors: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [offlineData, setOfflineData] = useState({ receipts: 0, vendors: 0, projects: 0, estimates: 0 });

  useEffect(() => {
    // Load offline settings
    loadOfflineSettings();

    // Update network status
    updateNetworkStatus();

    // Set up periodic updates
    const interval = setInterval(() => {
      updateNetworkStatus();
      updateOfflineStats();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadOfflineSettings = async () => {
    try {
      const enabled = await offlineService.getSetting('offlineEnabled');
      setIsOfflineEnabled(enabled || false);
    } catch (error) {
      console.error('Failed to load offline settings:', error);
    }
  };

  const updateNetworkStatus = () => {
    const status = offlineService.getNetworkStatus();
    setNetworkStatus(status);
  };

  const updateOfflineStats = async () => {
    try {
      const [receipts, vendors, projects, estimates, syncQueue] = await Promise.all([
        offlineService.getAllOffline('receipts'),
        offlineService.getAllOffline('vendors'),
        offlineService.getAllOffline('projects'),
        offlineService.getAllOffline('estimates'),
        offlineService.getAllOffline('syncQueue')
      ]);

      setOfflineData({
        receipts: receipts.length,
        vendors: vendors.length,
        projects: projects.length,
        estimates: estimates.length
      });

      const pending = receipts.filter(r => r.syncStatus === 'pending').length +
                    vendors.filter(v => v.syncStatus === 'pending').length +
                    projects.filter(p => p.syncStatus === 'pending').length +
                    estimates.filter(e => e.syncStatus === 'pending').length;

      const synced = receipts.filter(r => r.syncStatus === 'synced').length +
                    vendors.filter(v => v.syncStatus === 'synced').length +
                    projects.filter(p => p.syncStatus === 'synced').length +
                    estimates.filter(e => e.syncStatus === 'synced').length;

      setSyncStats({
        pending,
        synced,
        errors: syncQueue.length
      });
    } catch (error) {
      console.error('Failed to update offline stats:', error);
    }
  };

  const toggleOfflineMode = async () => {
    const newState = !isOfflineEnabled;
    setIsOfflineEnabled(newState);

    try {
      await offlineService.setSetting('offlineEnabled', newState);

      if (newState) {
        console.log('📴 Offline mode enabled');
      } else {
        console.log('🌐 Offline mode disabled');
      }
    } catch (error) {
      console.error('Failed to toggle offline mode:', error);
      setIsOfflineEnabled(!newState); // Revert on error
    }
  };

  const handleManualSync = async () => {
    if (!networkStatus.isOnline) {
      alert('Cannot sync while offline');
      return;
    }

    try {
      await offlineService.syncPendingChanges();
      await updateOfflineStats();
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };

  const handleClearOfflineData = async () => {
    if (window.confirm('Are you sure you want to clear all offline data? This action cannot be undone.')) {
      try {
        await offlineService.clearAllData();
        await updateOfflineStats();
        console.log('🗑️ Offline data cleared');
      } catch (error) {
        console.error('Failed to clear offline data:', error);
      }
    }
  };

  const getStatusColor = () => {
    if (!networkStatus.isOnline) return 'text-red-400';
    if (networkStatus.syncInProgress) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getStatusIcon = () => {
    if (!networkStatus.isOnline) return WifiOff;
    if (networkStatus.syncInProgress) return RefreshCw;
    return Wifi;
  };

  const StatusIcon = getStatusIcon();

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
            Offline Mode
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Access your receipts, quotes, and tasks even when offline. Changes sync automatically when you're back online.
          </p>
        </motion.div>

        {/* Network Status Card */}
        <motion.div
          className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-800/50 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
              <StatusIcon className={`w-6 h-6 ${getStatusColor()} ${networkStatus.syncInProgress ? 'animate-spin' : ''}`} />
              Network Status
            </h2>
            <button
              onClick={toggleOfflineMode}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                isOfflineEnabled
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/25'
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white'
              }`}
            >
              {isOfflineEnabled ? 'Offline Mode ON' : 'Offline Mode OFF'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-5 h-5 text-blue-400" />
                <span className="text-slate-300">Connection</span>
              </div>
              <p className={`text-lg font-semibold ${getStatusColor()}`}>
                {networkStatus.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Cloud className="w-5 h-5 text-purple-400" />
                <span className="text-slate-300">Sync Status</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {networkStatus.syncInProgress ? 'Syncing...' : 'Ready'}
              </p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <RefreshCw className="w-5 h-5 text-green-400" />
                <span className="text-slate-300">Pending Changes</span>
              </div>
              <p className="text-lg font-semibold text-white">
                {syncStats.pending}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Offline Data Overview */}
        <motion.div
          className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-800/50 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-400" />
              Offline Data
            </h2>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-xl transition-all duration-300"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{offlineData.receipts}</div>
              <div className="text-sm text-slate-400">Receipts</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{offlineData.vendors}</div>
              <div className="text-sm text-slate-400">Vendors</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{offlineData.projects}</div>
              <div className="text-sm text-slate-400">Projects</div>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">{offlineData.estimates}</div>
              <div className="text-sm text-slate-400">Estimates</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-sm text-green-400">Synced</span>
              </div>
              <div className="text-xl font-bold text-green-400">{syncStats.synced}</div>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <RefreshCw className="w-5 h-5 text-yellow-400" />
                <span className="text-sm text-yellow-400">Pending</span>
              </div>
              <div className="text-xl font-bold text-yellow-400">{syncStats.pending}</div>
            </div>
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-sm text-red-400">Errors</span>
              </div>
              <div className="text-xl font-bold text-red-400">{syncStats.errors}</div>
            </div>
          </div>
        </motion.div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-slate-800/50 shadow-lg"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-semibold text-white mb-4">Offline Settings</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                  <div>
                    <div className="text-white font-medium">Enable Offline Mode</div>
                    <div className="text-sm text-slate-400">Allow access to data when offline</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOfflineEnabled}
                      onChange={toggleOfflineMode}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleManualSync}
                    disabled={!networkStatus.isOnline || networkStatus.syncInProgress}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300"
                  >
                    <Upload className="w-4 h-4" />
                    Sync Now
                  </button>

                  <button
                    onClick={handleClearOfflineData}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-all duration-300"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Data
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50 shadow-lg"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <Download className="w-5 h-5 text-green-400" />
              How Offline Mode Works
            </h3>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Data is stored locally in your browser</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Access receipts, quotes, and tasks offline</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Changes sync automatically when online</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Works with existing quote calculations</span>
              </li>
            </ul>
          </motion.div>

          <motion.div
            className="bg-slate-900/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-800/50 shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
              <Cloud className="w-5 h-5 text-blue-400" />
              Sync Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Last Sync</span>
                <span className="text-white">
                  {networkStatus.syncInProgress ? 'In Progress...' : 'Ready'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Connection</span>
                <span className={`font-semibold ${getStatusColor()}`}>
                  {networkStatus.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Pending Sync</span>
                <span className="text-white">{syncStats.pending} items</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300">Storage Used</span>
                <span className="text-white">Local Browser</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OfflineMode;
