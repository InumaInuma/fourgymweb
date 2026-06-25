import React, { useState } from 'react';
import type { User } from '../../domain/entities';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { apiService } from '../../data/apiService';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member' | 'trainer' | 'nutritionist'>('member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isInstallable, installApp, showGuide, setShowGuide } = usePWAInstall();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, ingresa tu correo electrónico');
      return;
    }
    
    // Quick validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor, ingresa un correo válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const apiUser = await apiService.login(email);
      
      // Safety check: ensure selected UI role is matching the API role
      if (apiUser.role !== role) {
        let roleNameStr = 'Socio';
        if (role === 'admin') roleNameStr = 'Administrador';
        else if (role === 'trainer') roleNameStr = 'Trainer';
        else if (role === 'nutritionist') roleNameStr = 'Nutricionista';

        setError(`El correo ingresado no corresponde a un perfil de ${roleNameStr}.`);
        setLoading(false);
        return;
      }

      onLoginSuccess(apiUser);
    } catch (err: any) {
      setError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0b21] p-4 relative overflow-hidden">
      
      {/* Decorative glowing background bubbles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-green/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main card */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
        
        {/* Top brand header area */}
        <div className="bg-[#263238] p-8 text-center border-b border-white/5 relative">
          <div className="w-16 h-16 mx-auto bg-slate-900 border border-brand-green/30 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-green/5 overflow-hidden">
            <img src="/logo.png" alt="FourGym Logo" className="w-full h-full object-contain p-1" />
          </div>
          <h1 className="text-3xl font-black text-white mt-4 tracking-tighter">
            FOUR <span className="text-brand-green">GYM</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1">Tu salud, tu espacio, tu control</p>
        </div>

        {/* Form area */}
        <div className="p-8 bg-slate-950/40">
          
          {/* Role selector tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl mb-6 border border-white/5">
            <button
              type="button"
              onClick={() => setRole('member')}
              className={`py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                role === 'member'
                  ? 'bg-brand-green text-slate-950 shadow-md font-black'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              Socio
            </button>
            <button
              type="button"
              onClick={() => setRole('trainer')}
              className={`py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                role === 'trainer'
                  ? 'bg-brand-green text-slate-950 shadow-md font-black'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              Trainer
            </button>
            <button
              type="button"
              onClick={() => setRole('nutritionist')}
              className={`py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                role === 'nutritionist'
                  ? 'bg-brand-green text-slate-950 shadow-md font-black'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              Nutricionista
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                role === 'admin'
                  ? 'bg-brand-green text-slate-950 shadow-md font-black'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              Administrador
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Correo Electrónico
              </label>
              <div className="relative rounded-xl overflow-hidden">
                <input
                  type="email"
                  id="email"
                  disabled={loading}
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all disabled:opacity-50"
                />
              </div>
              {error && <p className="text-rose-400 text-xs mt-2 font-medium">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-brand-green hover:bg-brand-green-strong text-slate-950 font-black rounded-xl shadow-lg shadow-brand-green/20 hover:scale-[1.01] active:scale-95 transition-all duration-200 uppercase tracking-wider text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Ingresando...' : 'Continuar'}
            </button>
          </form>

          {/* Bottom links */}
          <div className="flex items-center justify-between mt-8 text-xs text-text-secondary border-t border-white/5 pt-6">
            <a href="#help" className="hover:text-white transition-colors">¿Necesitas ayuda?</a>
            <a href="#alternative" className="hover:text-white transition-colors">Ingresar de otra forma</a>
          </div>
        </div>

      </div>

      {/* PWA download button below card */}
      {isInstallable && (
        <div className="mt-6 text-center z-10">
          <button
            onClick={installApp}
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-brand-green/10 border border-brand-green/30 hover:bg-brand-green hover:text-slate-950 text-brand-green font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-brand-green/5 cursor-pointer hover:scale-[1.02] active:scale-95 animate-pulse-slow"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Instalar Aplicación</span>
          </button>
        </div>
      )}



      {/* Guide dialog modal for manual installation instructions */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 relative shadow-2xl scale-in text-left">
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

    </div>
  );
};
