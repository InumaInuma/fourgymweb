import React, { useState, useEffect } from 'react';
import type { User } from '../../../domain/entities';

interface AdminSidebarProps {
  user: User;
  activeTab: 'schedule' | 'attendance';
  setActiveTab: (tab: 'schedule' | 'attendance') => void;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('admin_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col justify-between bg-[#141226]/85 backdrop-blur-xl border-r border-white/5 text-white transition-all duration-300 ease-in-out z-45 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Section: Logo / Brand */}
      <div className="flex flex-col">
        <div className="h-16 flex items-center px-5 border-b border-white/5 select-none overflow-hidden">
          <div className="flex items-center space-x-3 min-w-[200px]">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-brand-green/30 flex items-center justify-center shadow-lg shadow-brand-green/5 overflow-hidden shrink-0">
              <img src="/logo.png" alt="FourGym Logo" className="w-full h-full object-contain p-0.5" />
            </div>
            <span
              className={`text-lg font-black tracking-tight text-white transition-opacity duration-200 ${
                isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
              }`}
            >
              FOUR <span className="text-brand-green">GYM</span>
            </span>
          </div>
        </div>

        {/* Admin Profile Area */}
        <div className="p-4 border-b border-white/5 bg-slate-950/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-brand-green-strong flex items-center justify-center font-bold text-brand-green shadow-inner shrink-0 relative group">
              {user.initials}
              {isCollapsed && (
                <div className="absolute left-14 bg-slate-900 border border-white/10 text-white text-xs rounded-lg py-1 px-2.5 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-xl">
                  {user.name} ({user.email})
                </div>
              )}
            </div>
            <div
              className={`flex flex-col min-w-0 transition-opacity duration-200 ${
                isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
              }`}
            >
              <span className="text-xs font-semibold text-white truncate">{user.name}</span>
              <span className="text-[10px] text-text-secondary truncate">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-2 flex-grow mt-2">
          {/* Programar Clases Button */}
          <button
            onClick={() => setActiveTab('schedule')}
            className={`w-full flex items-center rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer relative group ${
              isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
            } ${
              activeTab === 'schedule'
                ? 'bg-[#00b894] text-white shadow-lg shadow-[#00b894]/25 font-black'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span
              className={`transition-opacity duration-200 ${
                isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
              }`}
            >
              Programar Clases
            </span>
            {isCollapsed && (
              <div className="absolute left-14 bg-slate-900 border border-white/10 text-white text-xs rounded-lg py-1 px-2.5 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-xl font-bold">
                Programar Clases
              </div>
            )}
          </button>

          {/* Validar Asistencia Button */}
          <button
            onClick={() => setActiveTab('attendance')}
            className={`w-full flex items-center rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer relative group ${
              isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
            } ${
              activeTab === 'attendance'
                ? 'bg-[#00b894] text-white shadow-lg shadow-[#00b894]/25 font-black'
                : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <svg
              className="w-5 h-5 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.052 20M14.214 16.055a9.388 9.388 0 00-4.162.945M14.214 16.055c.085-.333.129-.682.129-1.04 0-2.072-1.398-3.818-3.32-4.341M10.052 20a11.382 11.382 0 01-5.011-1.228 4.128 4.128 0 017.532-2.492M10.052 20V19.9M5.041 18.772A9.39 9.39 0 0110 18.5a9.386 9.386 0 014.214-.945M10 18.5V18.4M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span
              className={`transition-opacity duration-200 ${
                isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
              }`}
            >
              Validar Asistencia
            </span>
            {isCollapsed && (
              <div className="absolute left-14 bg-slate-900 border border-white/10 text-white text-xs rounded-lg py-1 px-2.5 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-xl font-bold">
                Validar Asistencia
              </div>
            )}
          </button>
        </nav>
      </div>

      {/* Bottom Section: Logout & Collapse toggle */}
      <div className="flex flex-col p-3 border-t border-white/5 bg-slate-950/20">
        {/* Logout Button */}
        <button
          onClick={onLogout}
          className={`w-full flex items-center rounded-xl font-bold text-xs uppercase tracking-wider text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer relative group ${
            isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
          }`}
        >
          <svg className="w-5 h-5 shrink-0 text-rose-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span
            className={`transition-opacity duration-200 ${
              isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
            }`}
          >
            Cerrar Sesión
          </span>
          {isCollapsed && (
            <div className="absolute left-14 bg-slate-900 border border-white/10 text-rose-400 text-xs rounded-lg py-1 px-2.5 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-xl font-bold">
              Cerrar Sesión
            </div>
          )}
        </button>

        {/* Collapse Sidebar Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`mt-2 w-full flex items-center rounded-xl font-bold text-[10px] uppercase tracking-wider text-slate-400 hover:bg-white/5 hover:text-white transition-all cursor-pointer relative group ${
            isCollapsed ? 'justify-center p-2.5' : 'space-x-3 px-3 py-2.5'
          }`}
        >
          {isCollapsed ? (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          ) : (
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          )}
          <span
            className={`transition-opacity duration-200 ${
              isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
            }`}
          >
            Solo mostrar iconos
          </span>
        </button>
      </div>
    </aside>
  );
};
