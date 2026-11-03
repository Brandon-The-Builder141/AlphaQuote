import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  LogOut,
  LayoutTemplate
} from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { COMPANY_NAME } from '../config/site';

// Pass Eight (IRON shell): same navigation, routes, module gating and
// sign-out behavior as before — only the chrome changed. Blackened-steel
// sidebar with the IL monogram on desktop; on phones the sidebar gives
// way to a top bar + bottom tab bar (Brandon runs this from his iPhone).
const PAGE_TITLES = [
  ['/estimate/advanced', 'Advanced Estimator'],
  ['/estimate', 'New Estimate'],
  ['/result', 'Estimate Result'],
  ['/receipts', 'Receipts'],
  ['/vendors', 'Vendors'],
  ['/projects', 'Project Budget'],
  ['/analytics', 'Analytics'],
  ['/followups', 'Follow-Ups'],
  ['/accounting', 'Accounting'],
  ['/scheduling', 'Scheduling'],
  ['/profile', 'Profile'],
  ['/offline', 'Offline Mode'],
  ['/dashboard', 'Dashboard'],
  ['/', 'Dashboard']
];

function pageTitle(pathname) {
  const match = PAGE_TITLES.find(([prefix]) => prefix !== '/' && pathname.startsWith(prefix));
  return match ? match[1] : 'Dashboard';
}

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [enabledModules] = useState(getEnabledModules());

  const navigationItems = [
    { icon: Home, label: 'Dashboard', path: '/', alwaysShow: true },
    { icon: Calculator, label: 'New Estimate', path: '/estimate', alwaysShow: true },
    { icon: Receipt, label: 'Receipts', path: '/receipts', alwaysShow: true },
    { icon: Store, label: 'Vendors', path: '/vendors', module: 'vendorManagement' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics', alwaysShow: true },
    { icon: Mail, label: 'Follow-Ups', path: '/followups', alwaysShow: true },
    { icon: Download, label: 'Accounting', path: '/accounting', alwaysShow: true },
    { icon: Calendar, label: 'Scheduling', path: '/scheduling', alwaysShow: true },
    { icon: Settings, label: 'Profile', path: '/profile', alwaysShow: true }
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

  // Bottom tab bar (mobile primary nav). "Templates" lives inside the
  // advanced estimator, so its tab points at /estimate/advanced.
  const tabItems = [
    { icon: Home, label: 'Dashboard', path: '/', active: isActive('/') },
    {
      icon: Calculator,
      label: 'Estimates',
      path: '/estimate',
      active: location.pathname === '/estimate' || location.pathname === '/result'
    },
    {
      icon: LayoutTemplate,
      label: 'Templates',
      path: '/estimate/advanced',
      active: location.pathname.startsWith('/estimate/advanced')
    },
    { icon: Store, label: 'Vendors', path: '/vendors', active: isActive('/vendors') },
    { icon: Receipt, label: 'Receipts', path: '/receipts', active: isActive('/receipts') },
    { icon: Settings, label: 'Profile', path: '/profile', active: isActive('/profile') }
  ];

  const title = pageTitle(location.pathname);

  return (
    <div className="iron-bg min-h-screen text-slate-100 font-body">
      {/* ------- Desktop sidebar ------- */}
      <aside className={`shell-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 pt-6 pb-5 border-b border-slate-700">
          <span className="il-monogram">IL</span>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="font-display text-[1.35rem] leading-none text-slate-100 truncate">
                Iron Legion
              </p>
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-400 mt-1">
                Command Center
              </p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="ml-auto flex-none w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-5 px-4">
          <div className="space-y-1.5">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`nav-link ${active ? 'active' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 flex-none" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleSignOut}
            className="nav-link hover:!text-red-400"
            title={isCollapsed ? 'Sign Out' : undefined}
          >
            <LogOut className="w-5 h-5 flex-none" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ------- Main column ------- */}
      <div className={`shell-main ${isCollapsed ? 'collapsed' : ''}`}>
        <header className="shell-topbar">
          <div className="flex items-center gap-3 min-w-0">
            <span className="il-monogram il-monogram-sm min-[861px]:hidden">IL</span>
            <h1 className="font-display text-[1.55rem] leading-none text-slate-100 truncate">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-3 flex-none">
            <span className="hidden md:block text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
              {COMPANY_NAME}
            </span>
            <button
              onClick={handleSignOut}
              aria-label="Sign out"
              className="min-[861px]:hidden w-11 h-11 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="shell-content">
          {children}
        </div>
      </div>

      {/* ------- Mobile bottom tab bar ------- */}
      <nav className="tabbar" aria-label="Primary">
        {tabItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`tab-link ${item.active ? 'active' : ''}`}
            >
              <Icon className="w-6 h-6" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
