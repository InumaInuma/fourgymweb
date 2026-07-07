import React, { useState } from 'react';
import type { User } from '../../domain/entities';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { apiService } from '../../data/apiService';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [step, setStep] = useState<'check-dni' | 'enter-password'>('check-dni');
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dniResult, setDniResult] = useState<{
    idPersona: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    correo: string;
    idUsuario: number;
    isRegistered: boolean;
    idRol: number;
  } | null>(null);

  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isInstallable, installApp, showGuide, setShowGuide } = usePWAInstall();

  const getRoleLabel = (roleId: number): string => {
    switch (roleId) {
      case 1:
        return 'Administrador';
      case 2:
        return 'Socio';
      case 3:
        return 'Instructor';
      case 4:
        return 'Entrenador (Trainer)';
      case 5:
        return 'Nutricionista';
      case 6:
        return 'Recepcionista';
      default:
        return `Rol ${roleId}`;
    }
  };

  const getRoleBadgeClass = (roleId: number): string => {
    switch (roleId) {
      case 1:
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/25';
      case 2:
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25';
      case 3:
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/25';
      case 4:
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/25';
      case 5:
        return 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/25';
      case 6:
        return 'bg-violet-500/10 text-violet-400 border border-violet-500/25';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/25';
    }
  };

  const handleCheckDni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni) {
      setError('Por favor, ingresa tu número de documento.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await apiService.checkDni(dni);
      setDniResult(result);
      
      // If isRegistered is false or null
      if (!result.isRegistered) {
        setModalError('');
        setPassword('');
        setConfirmPassword('');
        setEmail(result.correo || '');
        setShowRegisterModal(true);
      } else {
        setStep('enter-password');
      }
    } catch (err: any) {
      setError(err.message || 'El DNI ingresado no se encuentra registrado en el sistema. Por favor, acérquese a recepción.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setModalError('Por favor, ingresa tu correo electrónico.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setModalError('Por favor, ingresa un correo electrónico válido.');
      return;
    }
    if (!password || !confirmPassword) {
      setModalError('Por favor, completa todos los campos de contraseña.');
      return;
    }
    if (password.length < 6) {
      setModalError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setModalError('Las contraseñas ingresadas no coinciden.');
      return;
    }

    setLoading(true);
    setModalError('');

    try {
      const user = await apiService.registerPassword(dni, password, email);
      setShowRegisterModal(false);
      onLoginSuccess(user);
    } catch (err: any) {
      setModalError(err.message || 'Error al registrar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginDni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Por favor, ingresa tu contraseña.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await apiService.loginDni(dni, password);
      onLoginSuccess(user);
    } catch (err: any) {
      setError(err.message || 'La contraseña ingresada es incorrecta.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setError('');
    setPassword('');
    setConfirmPassword('');
    setStep('check-dni');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0b21] p-4 relative overflow-hidden">
      
      {/* Decorative glowing background bubbles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none"></div>

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
          
          {step === 'check-dni' && (
            <form onSubmit={handleCheckDni} className="space-y-6">
              <div>
                <label htmlFor="dni" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 text-center">
                  Número de Documento (DNI)
                </label>
                <div className="relative rounded-xl overflow-hidden">
                  <input
                    type="text"
                    id="dni"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    disabled={loading}
                    placeholder="Ingresa tu DNI de 8 dígitos"
                    value={dni}
                    onChange={(e) => {
                      setDni(e.target.value.replace(/\D/g, ''));
                      setError('');
                    }}
                    className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all disabled:opacity-50 text-center text-lg tracking-widest font-semibold"
                  />
                </div>
                {error && <p className="text-rose-400 text-xs mt-2 font-medium text-center">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading || dni.length === 0}
                className="w-full py-3.5 px-4 bg-brand-green hover:bg-brand-green-strong text-slate-950 font-black rounded-xl shadow-lg shadow-brand-green/20 hover:scale-[1.01] active:scale-95 transition-all duration-200 uppercase tracking-wider text-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? 'Verificando...' : 'Continuar'}
              </button>
            </form>
          )}

          {step === 'enter-password' && dniResult && (
            <form onSubmit={handleLoginDni} className="space-y-5">
              <div className="text-center pb-2">
                <p className="text-xs text-text-secondary uppercase tracking-widest">Bienvenido de nuevo</p>
                <h3 className="text-xl font-bold text-white mt-1">
                  {dniResult.nombre} {dniResult.apellidoPaterno}
                </h3>
                <div className="mt-2 inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                  <span className={`px-2 py-0.5 rounded-full ${getRoleBadgeClass(dniResult.idRol)}`}>
                    {getRoleLabel(dniResult.idRol)}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-3">
                  Ingresa tu contraseña de acceso para continuar.
                </p>
              </div>

              <div>
                <label htmlFor="loginPass" className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="loginPass"
                  disabled={loading}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all disabled:opacity-50 text-center font-semibold animate-pulse-once"
                />
                {error && <p className="text-rose-400 text-xs mt-2 font-medium text-center">{error}</p>}
              </div>

              <div className="flex flex-col space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-brand-green hover:bg-brand-green-strong text-slate-950 font-black rounded-xl shadow-lg shadow-brand-green/20 hover:scale-[1.01] active:scale-95 transition-all duration-200 uppercase tracking-wider text-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                </button>

                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white font-bold rounded-xl transition-all uppercase tracking-wider text-xs cursor-pointer disabled:opacity-50"
                >
                  Volver atrás
                </button>
              </div>
            </form>
          )}

          {/* Bottom links */}
          <div className="flex items-center justify-between mt-8 text-xs text-text-secondary border-t border-white/5 pt-6">
            <a href="#help" className="hover:text-white transition-colors">¿Necesitas ayuda?</a>
            <p className="text-slate-600">FourGym Safe Access</p>
          </div>
        </div>

      </div>

      {/* ----------------- GORGEOUS REGISTRATION MODAL OVERLAY ----------------- */}
      {showRegisterModal && dniResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-8 relative shadow-2xl text-left animate-scale-in">
            
            <button
              onClick={() => setShowRegisterModal(false)}
              disabled={loading}
              className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="text-center pb-2">
              <div className="w-12 h-12 mx-auto bg-brand-green/10 border border-brand-green/20 rounded-2xl flex items-center justify-center text-2xl shadow-inner mb-3">
                🔑
              </div>
              <p className="text-[10px] text-brand-green font-bold uppercase tracking-widest">Primera vez en el sistema</p>
              <h3 className="text-2xl font-black text-white mt-1">
                ¡Hola, {dniResult.nombre.split(' ')[0]}!
              </h3>
              <div className="mt-2 inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getRoleBadgeClass(dniResult.idRol)}`}>
                  {getRoleLabel(dniResult.idRol)}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-3 leading-relaxed">
                Detectamos que aún no has creado tu contraseña de acceso para este DNI. Por favor, crea una contraseña segura para activar tu cuenta en el sistema.
              </p>
            </div>

            <form onSubmit={handleRegisterPassword} className="space-y-4 mt-5">
              <div>
                <label htmlFor="modalEmail" className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="modalEmail"
                  disabled={loading}
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setModalError('');
                  }}
                  className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all disabled:opacity-50 text-center font-semibold"
                />
              </div>

              <div>
                <label htmlFor="modalPass" className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  id="modalPass"
                  disabled={loading}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setModalError('');
                  }}
                  className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all disabled:opacity-50 text-center font-semibold"
                />
              </div>

              <div>
                <label htmlFor="modalConfirmPass" className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  id="modalConfirmPass"
                  disabled={loading}
                  placeholder="Repite tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setModalError('');
                  }}
                  className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all disabled:opacity-50 text-center font-semibold"
                />
              </div>
              
              {modalError && <p className="text-rose-400 text-xs mt-2 font-medium text-center">{modalError}</p>}

              <div className="flex flex-col space-y-3 pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-brand-green hover:bg-brand-green-strong text-slate-950 font-black rounded-xl shadow-lg shadow-brand-green/20 hover:scale-[1.01] active:scale-95 transition-all duration-200 uppercase tracking-wider text-sm cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Registrando...' : 'Activar y Acceder'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white font-bold rounded-xl transition-all uppercase tracking-wider text-xs cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PWA download button below card */}
      {isInstallable && (
        <div className="mt-6 text-center z-10">
          <button
            onClick={installApp}
            className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-brand-green/10 border border-brand-green/30 hover:bg-brand-green hover:text-slate-950 text-brand-green font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-brand-green/5 cursor-pointer hover:scale-[1.02] active:scale-95"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 relative shadow-2xl text-left animate-fade-in">
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
