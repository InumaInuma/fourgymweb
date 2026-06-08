import React, { useState } from 'react';
import type { User } from '../../domain/entities';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member'>('member');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
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

    // Mock Login Success
    const initials = email
      .split('@')[0]
      .substring(0, 2)
      .toUpperCase();

    onLoginSuccess({
      id: 'usr-' + Math.random().toString(36).substring(2, 11),
      name: email.split('@')[0].toUpperCase(),
      email: email,
      initials: initials || 'GY',
      role: role,
      subscriptionType: role === 'member' ? 'Premium' : 'Admin Staff'
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0b21] p-4 relative overflow-hidden">
      
      {/* Decorative glowing background bubbles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-green/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-cyan/10 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Main card */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">
        
        {/* Top brand header area */}
        <div className="bg-[#263238] p-8 text-center border-b border-white/5 relative">
          <div className="w-16 h-16 mx-auto bg-slate-900 border-2 border-brand-green rounded-2xl flex items-center justify-center shadow-lg shadow-brand-green/10 animate-pulse">
            <svg className="w-8 h-8 text-brand-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-white mt-4 tracking-tighter">
            FOUR <span className="text-brand-green">GYM</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1">Tu salud, tu espacio, tu control</p>
        </div>

        {/* Form area */}
        <div className="p-8 bg-slate-950/40">
          
          {/* Role selector tabs */}
          <div className="flex bg-slate-950 p-1 rounded-xl mb-6 border border-white/5">
            <button
              type="button"
              onClick={() => setRole('member')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                role === 'member'
                  ? 'bg-brand-green text-slate-950 shadow-md'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              Socio
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                role === 'admin'
                  ? 'bg-brand-green text-slate-950 shadow-md'
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
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all"
                />
              </div>
              {error && <p className="text-rose-400 text-xs mt-2 font-medium">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-brand-green hover:bg-brand-green-strong text-slate-950 font-black rounded-xl shadow-lg shadow-brand-green/20 hover:scale-[1.01] active:scale-95 transition-all duration-200 uppercase tracking-wider text-sm cursor-pointer"
            >
              Continuar
            </button>
          </form>

          {/* Bottom links */}
          <div className="flex items-center justify-between mt-8 text-xs text-text-secondary border-t border-white/5 pt-6">
            <a href="#help" className="hover:text-white transition-colors">¿Necesitas ayuda?</a>
            <a href="#alternative" className="hover:text-white transition-colors">Ingresar de otra forma</a>
          </div>
        </div>

      </div>

      {/* Mini floating award badge similar to FAB in mobile app */}
      <div className="fixed bottom-6 right-6 w-12 h-12 rounded-2xl bg-slate-900 border border-brand-green/30 flex items-center justify-center text-brand-green shadow-lg shadow-black/50 cursor-pointer hover:scale-105 active:scale-95 transition-all">
        <svg className="w-5 h-5 text-brand-green-strong" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </div>

    </div>
  );
};
