import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getEnabledModules } from '../utils/moduleVisibility';
import {
  Calculator,
  Receipt,
  Store,
  BarChart3,
  Mail,
  Download,
  Calendar,
  Settings,
  Home,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [enabledModules] = useState(getEnabledModules());

  const navigationItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/',
      color: 'text-blue-400',
      hoverColor: 'hover:bg-blue-500/10',
      alwaysShow: true
    },
    {
      icon: Calculator,
      label: 'New Estimate',
      path: '/estimate',
      color: 'text-primary',
      hoverColor: 'hover:bg-primary/10',
      alwaysShow: true
    },
    {
      icon: Receipt,
      label: 'Receipts',
      path: '/receipts',
      color: 'text-orange-400',
      hoverColor: 'hover:bg-orange-500/10',
      alwaysShow: true
    },
    {
      icon: Store,
      label: 'Vendors',
      path: '/vendors',
      color: 'text-purple-400',
      hoverColor: 'hover:bg-purple-500/10',
      module: 'vendorManagement'
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      path: '/analytics',
      color: 'text-green-400',
      hoverColor: 'hover:bg-green-500/10',
      alwaysShow: true
    },
    {
      icon: Mail,
      label: 'Follow-Ups',
      path: '/followups',
      color: 'text-blue-400',
      hoverColor: 'hover:bg-blue-500/10',
      alwaysShow: true
    },
    {
      icon: Download,
      label: 'Accounting',
      path: '/accounting',
      color: 'text-orange-400',
      hoverColor: 'hover:bg-orange-500/10',
      alwaysShow: true
    },
    {
      icon: Calendar,
      label: 'Scheduling',
      path: '/scheduling',
      color: 'text-purple-400',
      hoverColor: 'hover:bg-purple-500/10',
      alwaysShow: true
    },
    {
      icon: Settings,
      label: 'Profile',
      path: '/profile',
      color: 'text-slate-400',
      hoverColor: 'hover:bg-slate-500/10',
      alwaysShow: true
    }
  ];

  const visibleItems = navigationItems.filter(item =>
    item.alwaysShow || (item.module && enabledModules[item.module])
  );

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/sign-in');
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Left Sidebar Navigation */}
      <motion.div
        className={`fixed left-0 top-0 h-screen bg-slate-900/95 backdrop-blur-sm border-r border-slate-800/50 shadow-2xl z-50 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center justify-between">
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-heading text-white">AlphaQuote</h1>
                    <p className="text-xs text-slate-400">Pro Estimates</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <motion.button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </motion.button>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <div className="space-y-2">
            {visibleItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <motion.button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-primary/20 border border-primary/30 text-white shadow-lg shadow-primary/20'
                      : `text-slate-400 ${item.hoverColor} hover:text-white border border-transparent`
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ x: 4, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`flex-shrink-0 ${active ? 'text-primary' : item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-medium text-sm truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {active && !isCollapsed && (
                    <motion.div
                      className="ml-auto w-2 h-2 bg-primary rounded-full"
                      layoutId="activeIndicator"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </nav>

        {/* Footer - Sign Out */}
        <div className="p-4 border-t border-slate-800/50">
          <motion.button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-5 h-5" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="font-medium text-sm"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
}

