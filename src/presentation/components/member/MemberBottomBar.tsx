import React from 'react';
import type { User } from '../../../domain/entities';

interface MemberBottomBarProps {
  user: User;
  activeTab: 'home' | 'classes' | 'bookings' | 'notifications';
  setActiveTab: (tab: 'home' | 'classes' | 'bookings' | 'notifications') => void;
  unreadNotificationsCount: number;
  onMenuToggle: () => void;
}

export const MemberBottomBar: React.FC<MemberBottomBarProps> = ({
  user,
  activeTab,
  setActiveTab,
  unreadNotificationsCount,
  onMenuToggle,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#141226]/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 md:hidden z-40 shadow-2xl">
      {/* 1. Left profile initials (Toggles sidebar drawer) */}
      <button
        onClick={onMenuToggle}
        className="w-9 h-9 rounded-full bg-indigo-600 border border-slate-700 flex items-center justify-center text-white font-bold text-xs relative shrink-0 cursor-pointer active:scale-95"
      >
        {user.initials}
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute bottom-0 right-0 border-2 border-[#141226]"></span>
      </button>

      {/* 2. Orange Document icon (Bookings) */}
      <button
        onClick={() => setActiveTab('bookings')}
        className={`p-2 rounded-xl transition-all cursor-pointer active:scale-95 ${
          activeTab === 'bookings' ? 'bg-[#ff793f]/10 text-[#ff793f]' : 'text-slate-400'
        }`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </button>

      {/* 3. Center Raised Green Home button (Home page) */}
      <div className="relative w-14 h-14 -translate-y-4 shrink-0">
        <button
          onClick={() => setActiveTab('home')}
          className={`w-14 h-14 flex items-center justify-center rounded-full shadow-lg shadow-[#00b894]/30 border-4 border-[#0f0b21] transition-all cursor-pointer active:scale-95 ${
            activeTab === 'home' ? 'bg-[#00b894] text-white' : 'bg-slate-800 text-slate-400'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        </button>
      </div>

      {/* 4. Bell/Notification icon */}
      <button
        onClick={() => setActiveTab('notifications')}
        className={`p-2 rounded-xl transition-all cursor-pointer relative active:scale-95 ${
          activeTab === 'notifications' ? 'bg-[#00b894]/10 text-[#00b894]' : 'text-slate-400'
        }`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadNotificationsCount > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[8px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-[#141226] animate-pulse">
            {unreadNotificationsCount}
          </span>
        )}
      </button>

      {/* 5. Right Hamburger menu icon (Toggles sidebar drawer) */}
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-xl text-slate-400 cursor-pointer active:scale-95"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>
    </div>
  );
};
