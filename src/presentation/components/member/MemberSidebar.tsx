import React, { useState, useEffect } from 'react';
import type { User } from '../../../domain/entities';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface MemberSidebarProps {
  user: User;
  activeTab: 'home' | 'classes' | 'bookings' | 'notifications';
  setActiveTab: (tab: 'home' | 'classes' | 'bookings' | 'notifications') => void;
  unreadNotificationsCount: number;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const MemberSidebar: React.FC<MemberSidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  unreadNotificationsCount,
  onLogout,
  isOpen,
  onClose,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('member_sidebar_collapsed') === 'true';
  });

  const { isInstallable, installApp, showGuide, setShowGuide } = usePWAInstall();

  useEffect(() => {
    localStorage.setItem('member_sidebar_collapsed', String(isCollapsed));
  }, [isCollapsed]);

  // Adjust arrow direction based on collapsed/expanded state
  // On mobile, the sidebar is on the right, so:
  // - Collapsed (w-20): Expand button should point LEFT (<) to slide the expanded menu in.
  // - Expanded (w-64): Collapse button should point RIGHT (>) to slide it back.
  const arrowIcon = isCollapsed ? (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ) : (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );

  return (
    <>
      {/* Backdrop overlay for mobile screen when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-45 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`h-screen z-50 transition-all duration-300 ease-in-out flex flex-col justify-between bg-[#141226]/85 backdrop-blur-xl border-l md:border-l-0 md:border-r border-white/5 text-white fixed top-0 right-0 md:sticky md:left-0 md:right-auto ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}
      >
        {/* Top Section: Logo / Brand & Mobile Close Button */}
        <div className="flex flex-col">
          <div className="h-16 flex items-center px-5 border-b border-white/5 select-none overflow-hidden justify-between">
            <div className="flex items-center space-x-3 min-w-[150px]">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-brand-green/30 flex items-center justify-center shadow-lg shadow-brand-green/10 overflow-hidden shrink-0">
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

            {/* Mobile close button (visible only on mobile) */}
            {isOpen && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer md:hidden"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Member Profile Area */}
          <div className="p-4 border-b border-white/5 bg-slate-950/20">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-accent-cyan flex items-center justify-center font-bold text-accent-cyan shadow-inner shrink-0 relative group">
                {user.initials}
                {isCollapsed && (
                  <div className="absolute left-14 bg-slate-900 border border-white/10 text-white text-xs rounded-lg py-1 px-2.5 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-xl">
                    {user.name} ({user.subscriptionType || 'Socio'})
                  </div>
                )}
              </div>
              <div
                className={`flex flex-col min-w-0 transition-opacity duration-200 ${
                  isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                }`}
              >
                <span className="text-xs font-semibold text-white truncate">{user.name}</span>
                <span className="text-[10px] text-text-secondary truncate bg-accent-cyan/10 text-accent-cyan font-bold px-2 py-0.5 rounded-full self-start mt-0.5">
                  {user.subscriptionType || 'Premium'}
                </span>
              </div>
            </div>
          </div>

          {/* PWA Download Button in Top Sidebar area if Collapsed */}
          {isInstallable && isCollapsed && (
            <div className="p-3 border-b border-white/5 flex justify-center">
              <button
                onClick={installApp}
                className="w-10 h-10 rounded-full bg-white text-slate-950 flex items-center justify-center hover:bg-slate-100 shadow-md shadow-white/10 shrink-0 relative group transition-all"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <div className="absolute left-14 bg-slate-900 border border-white/10 text-white text-xs rounded-lg py-1 px-2.5 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-xl font-bold">
                  Instalar App
                </div>
              </button>
            </div>
          )}

          {/* PWA Download Button in Top Sidebar area if Expanded */}
          {isInstallable && !isCollapsed && (
            <div className="p-4 border-b border-white/5">
              <button
                onClick={installApp}
                className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-full shadow-lg transition-colors cursor-pointer text-xs uppercase tracking-wider"
              >
                <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span>Instalar App</span>
              </button>
            </div>
          )}

          {/* Navigation Menu */}
          <nav className="p-3 space-y-2 flex-grow mt-2">
            {/* Inicio Button */}
            <button
              onClick={() => {
                setActiveTab('home');
                if (isOpen) onClose(); // Close mobile drawer on tab select
              }}
              className={`w-full flex items-center rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer relative group ${
                isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
              } ${
                activeTab === 'home'
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <span
                className={`transition-opacity duration-200 ${
                  isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                }`}
              >
                Inicio
              </span>
              {isCollapsed && (
                <div className="absolute left-14 bg-slate-900 border border-white/10 text-white text-xs rounded-lg py-1 px-2.5 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-xl font-bold">
                  Inicio
                </div>
              )}
            </button>

            {/* Clases Button */}
            <button
              onClick={() => {
                setActiveTab('classes');
                if (isOpen) onClose(); // Close mobile drawer on tab select
              }}
              className={`w-full flex items-center rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer relative group ${
                isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
              } ${
                activeTab === 'classes'
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span
                className={`transition-opacity duration-200 ${
                  isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                }`}
              >
                Clases
              </span>
              {isCollapsed && (
                <div className="absolute left-14 bg-slate-900 border border-white/10 text-white text-xs rounded-lg py-1 px-2.5 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-xl font-bold">
                  Clases
                </div>
              )}
            </button>

            {/* Mis Reservas Button */}
            <button
              onClick={() => {
                setActiveTab('bookings');
                if (isOpen) onClose();
              }}
              className={`w-full flex items-center rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer relative group ${
                isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
              } ${
                activeTab === 'bookings'
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              <span
                className={`transition-opacity duration-200 ${
                  isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                }`}
              >
                Mis Reservas
              </span>
              {isCollapsed && (
                <div className="absolute left-14 bg-slate-900 border border-white/10 text-white text-xs rounded-lg py-1 px-2.5 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-xl font-bold">
                  Mis Reservas
                </div>
              )}
            </button>

            {/* Notificaciones Button */}
            <button
              onClick={() => {
                setActiveTab('notifications');
                if (isOpen) onClose();
              }}
              className={`w-full flex items-center rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer relative group ${
                isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
              } ${
                activeTab === 'notifications'
                  ? 'bg-[#00b894] text-white shadow-lg shadow-[#00b894]/25 font-black'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="relative shrink-0 flex items-center justify-center">
                <svg
                  className="w-5 h-5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
                {unreadNotificationsCount > 0 && isCollapsed && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </div>
              <span
                className={`transition-opacity duration-200 flex-grow text-left ${
                  isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                }`}
              >
                Notificaciones
              </span>
              {unreadNotificationsCount > 0 && !isCollapsed && (
                <span className="bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-slate-900 animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
              {isCollapsed && (
                <div className="absolute left-14 bg-slate-900 border border-white/10 text-white text-xs rounded-lg py-1 px-2.5 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-xl font-bold">
                  Notificaciones
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
            {arrowIcon}
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

      {/* Guide dialog modal for manual installation instructions */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-slate-300">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 relative shadow-2xl scale-in">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-lg font-black text-white flex items-center gap-2">
              📥 Instalar Aplicación FourGym
            </h3>
            <p className="text-xs text-text-secondary mt-2">
              Sigue las sencillas instrucciones según tu dispositivo para tener el acceso directo en tu celular o computadora:
            </p>

            <div className="mt-5 space-y-4 text-xs">
              <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5">
                <span className="font-bold text-brand-green block mb-1">💻 Computadoras (Chrome, Edge, Opera)</span>
                <p className="text-slate-300">Haz clic en el ícono de **Instalar** (pantalla con flecha hacia abajo o botón "+") ubicado a la derecha de la barra de direcciones de tu navegador.</p>
              </div>

              <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5">
                <span className="font-bold text-accent-cyan block mb-1">📱 Dispositivos iPhone / iPad (Safari)</span>
                <p className="text-slate-300">Presiona el botón de **Compartir** (cuadrado con flecha hacia arriba) en la barra inferior y luego selecciona la opción **"Agregar a inicio"** o **"Add to Home Screen"**.</p>
              </div>

              <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5">
                <span className="font-bold text-amber-400 block mb-1">🤖 Dispositivos Android (Chrome)</span>
                <p className="text-slate-300">Haz clic en los tres puntos del menú del navegador y selecciona **"Instalar aplicación"** o **"Agregar a la pantalla principal"**.</p>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-6 w-full py-2.5 bg-brand-green hover:bg-brand-green-strong text-slate-950 font-black rounded-xl uppercase tracking-wider text-xs transition-colors cursor-pointer"
            >
              Cerrar Guía
            </button>
          </div>
        </div>
      )}
    </>
  );
};
