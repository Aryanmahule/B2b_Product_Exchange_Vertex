import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  LayoutDashboard, Store, Package, ArrowLeftRight,
  MessageSquare, User, LogOut, Bell, Sparkles, BarChart2, Menu, X
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/marketplace', icon: Store, label: 'Marketplace' },
  { to: '/matches', icon: Sparkles, label: 'AI Matches' },
  { to: '/products', icon: Package, label: 'My Products' },
  { to: '/requests', icon: ArrowLeftRight, label: 'Requests' },
  { to: '/negotiations', icon: MessageSquare, label: 'Negotiations' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Layout({ children }) {
  const { company, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    api.get('/notifications').then((r) => setNotifications(r.data)).catch(() => {});
    const interval = setInterval(() => {
      api.get('/notifications').then((r) => setNotifications(r.data)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const unread = notifications.filter((n) => !n.is_read).length;

  const handleMarkRead = () => {
    api.put('/notifications/read').then(() => {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    });
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-bold text-slate-800 text-lg">SymbioTrade</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">AI B2B Exchange Platform</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center text-sky-700 font-bold text-sm">
            {company?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{company?.name}</p>
            <p className="text-xs text-slate-400 truncate">{company?.industry}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600">
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-white border-r border-slate-200 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-white border-r border-slate-200 flex flex-col">
            <Sidebar />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <button className="md:hidden p-1" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="relative">
            <button onClick={() => { setShowNotif(!showNotif); if (!showNotif) handleMarkRead(); }}
              className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <Bell size={20} className="text-slate-600" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>
            {showNotif && (
              <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50">
                <div className="p-3 border-b border-slate-100 font-medium text-sm">Notifications</div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="p-4 text-sm text-slate-400 text-center">No notifications</p>
                  ) : notifications.map((n) => (
                    <div key={n.id} className={`p-3 border-b border-slate-50 ${!n.is_read ? 'bg-sky-50' : ''}`}>
                      <p className="text-sm font-medium text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
