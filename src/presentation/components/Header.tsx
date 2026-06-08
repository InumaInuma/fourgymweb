import React from 'react';
import type { User } from '../../domain/entities';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3 select-none">
          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-brand-green/30 flex items-center justify-center shadow-lg shadow-brand-green/10">
            <svg className="w-5 h-5 text-brand-green animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            FOUR <span className="text-brand-green">GYM</span>
          </span>
        </div>

        {/* Navigation / Actions */}
        {user ? (
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-semibold text-white">{user.name}</span>
              <span className="text-xs text-text-secondary">{user.email}</span>
            </div>
            
            {/* User Avatar Initials */}
            <div className="relative group">
              <button className="w-10 h-10 rounded-full bg-slate-800 border-2 border-brand-green-strong flex items-center justify-center font-bold text-brand-green shadow-inner hover:scale-105 transition-all duration-300">
                {user.initials}
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-white/10 p-2 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform scale-95 group-hover:scale-100 origin-top-right">
                <div className="px-3 py-2 border-b border-white/5 text-xs text-text-secondary md:hidden">
                  <p className="font-semibold text-white">{user.name}</p>
                  <p>{user.email}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-brand-green animate-ping"></span>
            <span className="text-xs font-semibold text-brand-green/80 uppercase tracking-widest">Portal de Socios</span>
          </div>
        )}

      </div>
    </header>
  );
};
