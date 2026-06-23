import React, { useState, useEffect } from 'react';
import type { User } from '../../domain/entities';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { apiService } from '../../data/apiService';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { isInstallable, installApp, showGuide, setShowGuide } = usePWAInstall();

  const loadNotifications = async () => {
    if (user && user.role === 'member') {
      try {
        const data = await apiService.getNotificacionesSocio(parseInt(user.id, 10));
        setNotifications(data);
      } catch (err) {
        console.error('Error loading notifications:', err);
      }
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (idNotificacionUsuario: number) => {
    try {
      const success = await apiService.marcarNotificacionLeida(idNotificacionUsuario, user?.name || 'WebSystem');
      if (success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.idNotificacionUsuario === idNotificacionUsuario ? { ...n, leida: true } : n
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

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

        {/* Action Controls */}
        <div className="flex items-center space-x-4">
          
          {/* PWA Install Button */}
          {isInstallable && (
            <button
              onClick={installApp}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-brand-green/10 border border-brand-green/20 hover:bg-brand-green hover:text-slate-950 text-brand-green font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-brand-green/5 animate-pulse-slow cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>Descargar App</span>
            </button>
          )}

          {user ? (
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-semibold text-white">{user.name}</span>
                <span className="text-xs text-text-secondary">{user.email}</span>
              </div>

              {/* Notification Bell (only for members) */}
              {user.role === 'member' && (
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-inner relative cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                    {notifications.some((n) => !n.leida) && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-800 animate-pulse"></span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-white/10 p-3 shadow-2xl z-50 origin-top-right transition-all duration-300 max-h-96 overflow-y-auto">
                      <div className="px-1 py-1.5 border-b border-white/5 flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Notificaciones</span>
                        {notifications.some((n) => !n.leida) && (
                          <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-bold">
                            Nuevas
                          </span>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {notifications.length === 0 ? (
                          <p className="text-[10px] text-text-secondary text-center py-6">No tienes notificaciones por el momento.</p>
                        ) : (
                          notifications.map((n) => {
                            let icon = 'ℹ️';
                            if (n.tipo === 'Promocion') icon = '🏷️';
                            if (n.tipo === 'Alerta') icon = '⚠️';
                            return (
                              <div
                                key={n.idNotificacionUsuario}
                                onClick={() => !n.leida && handleMarkAsRead(n.idNotificacionUsuario)}
                                className={`p-2.5 rounded-xl transition-all text-left border border-transparent ${
                                  n.leida
                                    ? 'opacity-65 hover:bg-white/5 cursor-default'
                                    : 'bg-white/5 border-white/5 hover:border-brand-green/20 cursor-pointer'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                                    <span>{icon}</span> {n.titulo}
                                  </span>
                                  {!n.leida && (
                                    <span className="w-1.5 h-1.5 bg-accent-cyan rounded-full mt-1.5 shrink-0"></span>
                                  )}
                                </div>
                                <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">
                                  {n.mensaje}
                                </p>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

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
                    className="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
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

      </div>

      {/* Guide dialog modal for manual installation instructions */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
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

    </header>
  );
};
