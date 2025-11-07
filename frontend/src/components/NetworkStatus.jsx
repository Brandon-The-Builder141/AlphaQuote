/**
 * Network Status Indicator Component
 * Shows current network status and offline mode information
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import offlineWrapper from '../services/offlineWrapper';

const NetworkStatus = ({ className = '' }) => {
  const [networkStatus, setNetworkStatus] = useState({ isOnline: true, syncInProgress: false });
  const [offlineEnabled, setOfflineEnabled] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Initial load
    updateStatus();
    
    // Set up periodic updates
    const interval = setInterval(updateStatus, 5000);
    
    // Listen for online/offline events
    const handleOnline = () => updateStatus();
    const handleOffline = () => updateStatus();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const updateStatus = async () => {
    try {
      const status = offlineWrapper.getNetworkStatus();
      const enabled = offlineWrapper.isOfflineModeEnabled();
      
      setNetworkStatus(status);
      setOfflineEnabled(enabled);
      
      // Get pending sync count
      if (enabled) {
        const syncQueue = await offlineWrapper.getAllOffline('syncQueue');
        setPendingSync(syncQueue.length);
      }
    } catch (error) {
      console.error('Failed to update network status:', error);
    }
  };

  const getStatusColor = () => {
    if (!networkStatus.isOnline) return 'text-red-400 bg-red-900/20 border-red-500/30';
    if (networkStatus.syncInProgress) return 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30';
    if (pendingSync > 0) return 'text-orange-400 bg-orange-900/20 border-orange-500/30';
    return 'text-green-400 bg-green-900/20 border-green-500/30';
  };

  const getStatusIcon = () => {
    if (!networkStatus.isOnline) return WifiOff;
    if (networkStatus.syncInProgress) return RefreshCw;
    return Wifi;
  };

  const getStatusText = () => {
    if (!networkStatus.isOnline) return 'Offline';
    if (networkStatus.syncInProgress) return 'Syncing...';
    if (pendingSync > 0) return `${pendingSync} pending`;
    return 'Online';
  };

  const handleManualSync = async () => {
    if (!networkStatus.isOnline) return;
    
    try {
      await offlineWrapper.syncNow();
      await updateStatus();
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };

  const StatusIcon = getStatusIcon();

  if (!offlineEnabled) {
    return null; // Don't show if offline mode is disabled
  }

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 hover:scale-105 ${getStatusColor()}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <StatusIcon 
          className={`w-4 h-4 ${networkStatus.syncInProgress ? 'animate-spin' : ''}`} 
        />
        <span className="text-sm font-medium">{getStatusText()}</span>
        {pendingSync > 0 && (
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
        )}
      </motion.button>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            className="absolute top-full right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 shadow-xl z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Network Status</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Connection</span>
                  <div className="flex items-center gap-2">
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-sm font-medium text-white">
                      {networkStatus.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Sync Status</span>
                  <span className="text-sm font-medium text-white">
                    {networkStatus.syncInProgress ? 'Syncing...' : 'Ready'}
                  </span>
                </div>

                {pendingSync > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Pending Sync</span>
                    <span className="text-sm font-medium text-orange-400">
                      {pendingSync} items
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Offline Mode</span>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-sm font-medium text-green-400">Enabled</span>
                  </div>
                </div>
              </div>

              {networkStatus.isOnline && pendingSync > 0 && (
                <button
                  onClick={handleManualSync}
                  disabled={networkStatus.syncInProgress}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-all duration-300"
                >
                  <RefreshCw className={`w-4 h-4 ${networkStatus.syncInProgress ? 'animate-spin' : ''}`} />
                  Sync Now
                </button>
              )}

              {!networkStatus.isOnline && (
                <div className="flex items-center gap-2 p-2 bg-red-900/20 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">
                    Working offline. Changes will sync when online.
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NetworkStatus;
