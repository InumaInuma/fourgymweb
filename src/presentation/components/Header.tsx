import React from 'react';
import type { User } from '../../domain/entities';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const { isInstallable, installApp, showGuide, setShowGuide } = usePWAInstall();

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
