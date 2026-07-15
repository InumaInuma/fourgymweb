import React, { useState, useEffect } from 'react';
import type { User, GymClass } from '../../../../domain/entities';
import type { PlanMembresia, SocioConMembresia, CajaSesionActiva, CajaBalance } from '../../../../data/apiService';
import { apiService } from '../../../../data/apiService';
import { SocioDetailCard } from '../memberships/SocioDetailCard';
import { SocioMatriculaModal } from '../memberships/SocioMatriculaModal';

// Sub-components
import { AccessValidationModal } from './AccessValidationModal';
import { AbrirCajaModal, CerrarCajaModal, ArqueoCajaModal } from './CajaModals';

interface HomePanelProps {
  user: User;
  setActiveTab: (tab: 'home' | 'schedule' | 'attendance' | 'memberships' | 'collaborators' | 'pos' | 'inventory') => void;
}

const getLocalDateString = (date = new Date()): string => {
  return date.toLocaleDateString('sv-SE');
};

export const HomePanel: React.FC<HomePanelProps> = ({ user, setActiveTab }) => {
  const [cajaSesion, setCajaSesion] = useState<CajaSesionActiva | null>(null);
  const [cajaBalance, setCajaBalance] = useState<CajaBalance | null>(null);
  const [socios, setSocios] = useState<SocioConMembresia[]>([]);
  const [planes, setPlanes] = useState<PlanMembresia[]>([]);
  const [todayClasses, setTodayClasses] = useState<GymClass[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [selectedSucursal, setSelectedSucursal] = useState('San Miguel');
  const [selectedTurno, setSelectedTurno] = useState('Mañana');
  
  // Search & Check-in states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSocio, setSelectedSocio] = useState<SocioConMembresia | null>(null);
  const [activeValidationSocio, setActiveValidationSocio] = useState<SocioConMembresia | null>(null);
  const [showDetailCard, setShowDetailCard] = useState(false);
  const [recentCheckins, setRecentCheckins] = useState<{
    id: number;
    nombre: string;
    dni: string;
    codigo: string;
    timestamp: string;
    estado: string;
  }[]>([]);

  // Modals visibility
  const [isOpeningCaja, setIsOpeningCaja] = useState(false);
  const [isClosingCaja, setIsClosingCaja] = useState(false);
  const [isViewingBalance, setIsViewingBalance] = useState(false);
  const [isRegisteringSocio, setIsRegisteringSocio] = useState(false);

  // Form states loading & error
  const [cajaLoading, setCajaLoading] = useState(false);
  const [cajaError, setCajaError] = useState('');
  const [newSocioLoading, setNewSocioLoading] = useState(false);
  const [newSocioError, setNewSocioError] = useState('');

  // Notification Toast
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Get Caja Status
      const sesion = await apiService.getCajaSesionActiva();
      setCajaSesion(sesion);
      if (sesion) {
        const bal = await apiService.getCajaBalance(sesion.id);
        setCajaBalance(bal);
      }

      // 2. Get Members
      const list = await apiService.getSociosConMembresias();
      setSocios(list);

      // Populate recent checkins using real database members
      if (list.length > 0) {
        const seedCheckins = list.slice(0, 3).map((s, idx) => {
          const hours = ['08:15 a.m.', '08:32 a.m.', '09:05 a.m.'];
          return {
            id: s.idSocio + idx,
            nombre: `${s.nombre} ${s.apellidoPaterno}`,
            dni: s.numeroDocumento,
            codigo: `GYM-${String(s.idSocio).padStart(6, '0')}`,
            timestamp: hours[idx % hours.length],
            estado: s.estadoSocio
          };
        });
        setRecentCheckins(seedCheckins);
      }

      // 3. Get Membership Plans
      const pList = await apiService.getPlanesMembresias();
      setPlanes(pList);

      // 4. Get Today's Classes
      const todayStr = getLocalDateString();
      const classesData = await apiService.getClases(1, 10, todayStr, todayStr);
      setTodayClasses(classesData);
    } catch (e: any) {
      showToast(e.message || 'Error al cargar datos del panel.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle opening caja
  const handleAbrirCajaSubmit = async (montoApertura: string, comentarioCaja: string) => {
    setCajaLoading(true);
    setCajaError('');
    try {
      const parsedMonto = parseFloat(montoApertura);
      if (isNaN(parsedMonto) || parsedMonto < 0) {
        throw new Error('El monto de apertura debe ser un número válido positivo.');
      }
      await apiService.abrirCaja(parsedMonto, comentarioCaja || undefined);
      showToast('📥 Caja abierta correctamente.', 'success');
      setIsOpeningCaja(false);
      loadData();
    } catch (err: any) {
      setCajaError(err.message || 'Error al abrir la caja.');
    } finally {
      setCajaLoading(false);
    }
  };

  // Handle closing caja
  const handleCerrarCajaSubmit = async (montoCierreReal: string, comentarioCaja: string) => {
    if (!cajaSesion) return;
    setCajaLoading(true);
    setCajaError('');
    try {
      const parsedMonto = parseFloat(montoCierreReal);
      if (isNaN(parsedMonto) || parsedMonto < 0) {
        throw new Error('El monto de cierre real debe ser un número válido positivo.');
      }
      await apiService.cerrarCaja(
        cajaSesion.id,
        parsedMonto,
        comentarioCaja || undefined
      );
      showToast('📤 Caja cerrada y arqueo registrado.', 'success');
      setIsClosingCaja(false);
      loadData();
    } catch (err: any) {
      setCajaError(err.message || 'Error al cerrar la caja.');
    } finally {
      setCajaLoading(false);
    }
  };

  // Handle register and enroll new socio
  const handleSaveNewSocio = async (payload: any) => {
    setNewSocioLoading(true);
    setNewSocioError('');
    try {
      await apiService.registrarSocioConMembresia(payload);
      showToast('👤 Socio registrado y matriculado con éxito.', 'success');
      setIsRegisteringSocio(false);
      loadData();
    } catch (err: any) {
      setNewSocioError(err.message || 'Error al registrar socio.');
    } finally {
      setNewSocioLoading(false);
    }
  };


  // Check-in logic
  const handleCheckin = (s?: SocioConMembresia) => {
    const targetSocio = s || selectedSocio;
    if (!targetSocio) return;
    
    // Add to recent feed
    const now = new Date();
    const timestampStr = now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
    const code = `GYM-${String(targetSocio.idSocio).padStart(6, '0')}`;
    
    setRecentCheckins(prev => [
      {
        id: Date.now(),
        nombre: `${targetSocio.nombre} ${targetSocio.apellidoPaterno}`,
        dni: targetSocio.numeroDocumento,
        codigo: code,
        timestamp: timestampStr,
        estado: targetSocio.estadoSocio
      },
      ...prev
    ]);

    if (targetSocio.estadoSocio === 'Activo') {
      showToast(`✅ Acceso Permitido: Bienvenido, ${targetSocio.nombre}!`, 'success');
    } else if (targetSocio.estadoSocio === 'Congelado') {
      showToast(`❄️ Cuenta Congelada: Acceso denegado para ${targetSocio.nombre}.`, 'error');
    } else {
      showToast(`🚫 Cuenta Vencida/Inactiva: Acceso denegado para ${targetSocio.nombre}.`, 'error');
    }
  };

  // Autocomplete filtering
  const filteredSuggestions = searchQuery.trim() === ''
    ? []
    : (() => {
        const q = searchQuery.toLowerCase();
        return socios.filter(s => {
          const fullName = `${s.nombre} ${s.apellidoPaterno} ${s.apellidoMaterno || ''}`.toLowerCase();
          return fullName.includes(q) || s.numeroDocumento.includes(q);
        }).slice(0, 5);
      })();

  // Stats summary counts
  const activeMembersCount = socios.filter(s => s.estadoSocio === 'Activo').length;
  
  const expirationsToday = socios.filter(s => {
    if (!s.fechaFinMembresia) return false;
    const fin = new Date(s.fechaFinMembresia).toDateString();
    const today = new Date().toDateString();
    return fin === today;
  });

  const expirationsWeek = socios.filter(s => {
    if (!s.fechaFinMembresia) return false;
    const fin = new Date(s.fechaFinMembresia);
    const today = new Date();
    const diffTime = fin.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });

  // Gauge calculations
  const attendanceTarget = 200;
  const checkinsCount = recentCheckins.length;
  const checkinPercentage = Math.min(Math.round((checkinsCount / attendanceTarget) * 100), 100);
  const strokeDasharray = 2 * Math.PI * 44;
  const strokeDashoffset = strokeDasharray * (1 - checkinPercentage / 100);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-text-secondary font-semibold">Cargando consola de recepción...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header section with Branch and Shift selector dropdowns */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Hola, {user.name} 👋
          </h1>
          <p className="text-xs text-text-secondary mt-1">¡Bienvenida al panel de recepción!</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1a1c36]/60 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <span className="text-[10px] text-text-secondary uppercase font-bold">Sucursal:</span>
            <select
              value={selectedSucursal}
              onChange={(e) => setSelectedSucursal(e.target.value)}
              className="bg-transparent border-none text-white font-bold focus:outline-none cursor-pointer"
              style={{ background: '#1a1c36', color: '#fff' }}
            >
              <option value="San Miguel" style={{ background: '#1a1c36' }}>San Miguel</option>
              <option value="Miraflores" style={{ background: '#1a1c36' }}>Miraflores</option>
              <option value="Surco" style={{ background: '#1a1c36' }}>Surco</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#1a1c36]/60 border border-white/5 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <span className="text-[10px] text-text-secondary uppercase font-bold">Turno:</span>
            <select
              value={selectedTurno}
              onChange={(e) => setSelectedTurno(e.target.value)}
              className="bg-transparent border-none text-white font-bold focus:outline-none cursor-pointer"
              style={{ background: '#1a1c36', color: '#fff' }}
            >
              <option value="Mañana" style={{ background: '#1a1c36' }}>Mañana</option>
              <option value="Tarde" style={{ background: '#1a1c36' }}>Tarde</option>
              <option value="Noche" style={{ background: '#1a1c36' }}>Noche</option>
            </select>
          </div>
        </div>
      </div>

      {/* TOP SECTION: Quick stats cards (Mockup exact cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Socios Activos */}
        <div className="glass-panel p-5 border border-white/5 rounded-2xl flex items-center justify-between hover:border-white/10 transition-colors">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Socios Activos</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{activeMembersCount}</span>
            </div>
            <p className="text-[9px] font-bold text-brand-green flex items-center gap-1">
              <span>●</span> +12 este mes
            </p>
          </div>
          <div className="text-2xl bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center">🏋️</div>
        </div>

        {/* Card 2: Vencen Hoy */}
        <div className="glass-panel p-5 border border-white/5 rounded-2xl flex items-center justify-between hover:border-white/10 transition-colors">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Vencen Hoy</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{expirationsToday.length}</span>
            </div>
            <button 
              onClick={() => setActiveTab('memberships')}
              className="text-[9px] font-black text-accent-cyan hover:underline uppercase tracking-wider block cursor-pointer"
            >
              Ver lista →
            </button>
          </div>
          <div className="text-2xl bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center">⏰</div>
        </div>

        {/* Card 3: Vencen esta Semana */}
        <div className="glass-panel p-5 border border-white/5 rounded-2xl flex items-center justify-between hover:border-white/10 transition-colors">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Vencen esta Semana</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{expirationsWeek.length}</span>
            </div>
            <button 
              onClick={() => setActiveTab('memberships')}
              className="text-[9px] font-black text-accent-cyan hover:underline uppercase tracking-wider block cursor-pointer"
            >
              Ver lista →
            </button>
          </div>
          <div className="text-2xl bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center">📅</div>
        </div>

        {/* Card 4: Asistencia Hoy */}
        <div className="glass-panel p-5 border border-white/5 rounded-2xl flex items-center justify-between hover:border-white/10 transition-colors">
          <div className="space-y-1">
            <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest">Asistencia Hoy</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white">{checkinsCount}</span>
            </div>
            <p className="text-[9px] font-bold text-amber-400 flex items-center gap-0.5">
              ⚡ {checkinPercentage}% del total
            </p>
          </div>
          <div className="text-2xl bg-white/5 w-10 h-10 rounded-xl flex items-center justify-center">🔑</div>
        </div>

      </div>

      {/* Middle Section: Clases del Día & Circular Attendance Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Clases del Día (Próximas Reservas) */}
        <div className="lg:col-span-7 glass-panel p-6 border border-white/5 rounded-3xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1 h-3.5 bg-brand-green rounded-full"></span>
              Próximas Reservas (Clases de Hoy)
            </h3>
            <p className="text-[10px] text-text-secondary mt-0.5">Control de aforo y asistencia por sala.</p>
          </div>

          <div className="divide-y divide-white/5 space-y-3 pt-2">
            {todayClasses.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-secondary space-y-2">
                <p>No hay clases programadas para el día de hoy.</p>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] text-white hover:bg-white/10 cursor-pointer"
                >
                  Programar una clase
                </button>
              </div>
            ) : (
              todayClasses.slice(0, 4).map((c) => {
                const hourStr = c.fechaInicio
                  ? new Date(c.fechaInicio).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase()
                  : 'Sin hora';
                return (
                  <div key={c.id} className="pt-3 first:pt-0 flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-base">
                        🧘
                      </div>
                      <div>
                        <p className="font-bold text-white leading-tight">{c.title}</p>
                        <p className="text-[10px] text-text-secondary mt-0.5">Hoy {hourStr} · {c.roomName || 'Salón Principal'}</p>
                      </div>
                    </div>
                    <span className="font-mono text-slate-300 font-bold text-xs">
                      {c.spotsReserved} / <span className="text-text-secondary">{c.spotsTotal}</span>
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <button
            onClick={() => setActiveTab('schedule')}
            className="w-full text-center text-[10px] font-black text-brand-green hover:underline uppercase tracking-wider pt-4 border-t border-white/5 cursor-pointer"
          >
            Ver todas las clases →
          </button>
        </div>

        {/* Right Column: Attendance Circular Indicator */}
        <div className="lg:col-span-5 glass-panel p-6 border border-white/5 rounded-3xl space-y-4 flex flex-col items-center justify-center">
          <div className="w-full text-left self-start">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Progreso de Ingreso</h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 py-4">
            {/* SVG Circular Gauge */}
            <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="44"
                  className="text-slate-950/40"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="44"
                  className="text-brand-green"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black text-white">{checkinPercentage}%</span>
              </div>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <p className="text-sm font-black text-white leading-tight">
                {checkinsCount} / {attendanceTarget} socios
              </p>
              <p className="text-xs text-text-secondary leading-normal">
                han ingresado el día de hoy en este turno.
              </p>
              <button
                onClick={() => setActiveTab('attendance')}
                className="text-[10px] text-brand-green hover:underline font-bold uppercase tracking-wider block pt-2 text-left cursor-pointer"
              >
                Ver detalle →
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Main Search & Quick Validation Panel */}
      <div className="glass-panel p-6 border border-white/5 rounded-3xl space-y-5 relative z-20">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-5 bg-brand-green rounded-full"></span>
            Control de Acceso (Buscador de Socio)
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Escribe el DNI o el nombre para validar membresía, registrar ingreso o renovar.
          </p>
        </div>

        {/* Search Input bar */}
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ingrese DNI o nombre del socio..."
                className="w-full bg-[#110f22]/90 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-xs text-white focus:outline-none focus:border-brand-green font-semibold transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedSocio(null); }}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Suggestions Autocomplete */}
          {searchQuery && filteredSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-[#1a1c36] border border-white/10 rounded-2xl shadow-2xl z-30 overflow-hidden">
              {filteredSuggestions.map((s) => (
                <div
                  key={s.idSocio}
                  onClick={() => {
                    setSelectedSocio(s);
                    setActiveValidationSocio(s);
                    setSearchQuery('');
                  }}
                  className="px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-b-0 cursor-pointer flex justify-between items-center text-xs transition-colors"
                >
                  <div>
                    <p className="font-bold text-white">{s.nombre} {s.apellidoPaterno} {s.apellidoMaterno || ''}</p>
                    <p className="text-[10px] text-text-secondary mt-0.5">DNI: {s.numeroDocumento} · Cód: GYM-{String(s.idSocio).padStart(6, '0')}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                    s.estadoSocio === 'Activo'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : s.estadoSocio === 'Congelado'
                      ? 'bg-sky-500/10 border border-sky-500/30 text-sky-400'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                  }`}>
                    {s.estadoSocio}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM SECTION: ACCIONES RÁPIDAS (Matching mockup row) */}
      <div className="glass-panel p-6 border border-white/5 rounded-3xl space-y-4">
        <h3 className="text-xs font-black text-white uppercase tracking-wider">Acciones Rápidas</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          <button
            onClick={() => {
              const inp = document.querySelector('input[type="text"]') as HTMLInputElement;
              if (inp) inp.focus();
            }}
            className="flex flex-col items-center justify-center py-4 bg-[#141226]/50 border border-white/5 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group text-center"
          >
            <div className="text-lg mb-1 group-hover:scale-110 transition-transform">🔍</div>
            <span className="text-[10px] font-bold text-slate-300 group-hover:text-white uppercase tracking-wide">Buscar Socio</span>
          </button>

          <button
            onClick={() => setIsRegisteringSocio(true)}
            className="flex flex-col items-center justify-center py-4 bg-[#141226]/50 border border-white/5 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group text-center"
          >
            <div className="text-lg mb-1 group-hover:scale-110 transition-transform">💳</div>
            <span className="text-[10px] font-bold text-slate-300 group-hover:text-white uppercase tracking-wide">Nueva Matrícula</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className="flex flex-col items-center justify-center py-4 bg-[#141226]/50 border border-white/5 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group text-center"
          >
            <div className="text-lg mb-1 group-hover:scale-110 transition-transform">✓</div>
            <span className="text-[10px] font-bold text-slate-300 group-hover:text-white uppercase tracking-wide">Validar Asistencia</span>
          </button>

          <button
            onClick={() => setActiveTab('schedule')}
            className="flex flex-col items-center justify-center py-4 bg-[#141226]/50 border border-white/5 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group text-center"
          >
            <div className="text-lg mb-1 group-hover:scale-110 transition-transform">📅</div>
            <span className="text-[10px] font-bold text-slate-300 group-hover:text-white uppercase tracking-wide">Nueva Reserva</span>
          </button>

          <button
            onClick={() => setActiveTab('pos')}
            className="flex flex-col items-center justify-center py-4 bg-[#141226]/50 border border-white/5 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group text-center"
          >
            <div className="text-lg mb-1 group-hover:scale-110 transition-transform">🛍️</div>
            <span className="text-[10px] font-bold text-slate-300 group-hover:text-white uppercase tracking-wide">Venta Rápida (POS)</span>
          </button>
        </div>
      </div>

      {/* MIDDLE CONTAINER: Caja status widget */}
      {/* Caja Status Widget */}
      <div className="glass-panel p-6 border border-white/5 rounded-3xl space-y-5">
        <div>
          <h2 className="text-xs font-black text-white uppercase tracking-wider">Control de Caja y Turno</h2>
          <p className="text-[10px] text-text-secondary mt-0.5">Auditoría financiera del flujo en la recepción.</p>
        </div>

        {!cajaSesion ? (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center space-y-4">
            <p className="text-xs font-semibold text-rose-400 leading-relaxed">
              ⚠️ LA CAJA ESTÁ CERRADA.<br />Abre la caja para poder procesar renovaciones y cobros de matrículas.
            </p>
            <button
              onClick={() => setIsOpeningCaja(true)}
              className="w-full py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-strong text-slate-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
            >
              📥 Abrir Turno de Caja
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                  TURNO ACTIVO
                </span>
                <span className="text-[10px] text-slate-400 font-mono">ID: {cajaSesion.id}</span>
              </div>
              
              <div className="space-y-1.5 pt-1 text-[11px]">
                <div className="flex justify-between text-slate-300">
                  <span>Cajero:</span>
                  <span className="text-white font-bold">{user.name}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Apertura:</span>
                  <span className="text-white font-mono">{cajaSesion.montoApertura.toFixed(2)} S/</span>
                </div>
                {cajaBalance && (
                  <div className="flex justify-between text-slate-300 border-t border-white/5 pt-1.5 mt-1.5">
                    <span className="font-bold text-white">Total Recaudado:</span>
                    <span className="text-emerald-400 font-mono font-black">
                      {(
                        cajaBalance.totalEfectivo +
                        cajaBalance.totalYape +
                        cajaBalance.totalPlin +
                        cajaBalance.totalTransferencia +
                        cajaBalance.totalTarjeta +
                        cajaBalance.totalMixto
                      ).toFixed(2)} S/
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsViewingBalance(true)}
                className="flex-grow py-2 border border-white/10 hover:bg-white/5 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
              >
                📊 Arqueo
              </button>
              <button
                onClick={() => setIsClosingCaja(true)}
                className="flex-grow py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                📤 Cerrar Turno
              </button>
            </div>
          </div>
        )}
      </div>

      {/* EXTRACTED MODALS */}

      {/* Abrir Caja Modal */}
      <AbrirCajaModal
        isOpen={isOpeningCaja}
        onClose={() => setIsOpeningCaja(false)}
        onSubmit={handleAbrirCajaSubmit}
        loading={cajaLoading}
        errorMsg={cajaError}
      />

      {/* Cerrar Caja Modal */}
      <CerrarCajaModal
        isOpen={isClosingCaja}
        cajaBalance={cajaBalance}
        onClose={() => setIsClosingCaja(false)}
        onSubmit={handleCerrarCajaSubmit}
        loading={cajaLoading}
        errorMsg={cajaError}
      />

      {/* Arqueo Caja Modal */}
      <ArqueoCajaModal
        isOpen={isViewingBalance}
        cajaBalance={cajaBalance}
        onClose={() => setIsViewingBalance(false)}
      />



      {/* Validation Control Access Modal */}
      <AccessValidationModal
        socio={activeValidationSocio}
        onClose={() => setActiveValidationSocio(null)}
        onCheckin={(s) => {
          handleCheckin(s);
          setActiveValidationSocio(null);
        }}
        onViewProfile={(s) => {
          setSelectedSocio(s);
          setShowDetailCard(true);
          setActiveValidationSocio(null);
        }}
      />

      {/* MODAL: REGISTRAR & MATRICULAR NUEVO SOCIO */}
      {isRegisteringSocio && (
        <SocioMatriculaModal
          isOpen={isRegisteringSocio}
          onClose={() => setIsRegisteringSocio(false)}
          planes={planes}
          formLoading={newSocioLoading}
          errorMsg={newSocioError}
          onSave={handleSaveNewSocio}
        />
      )}

      {/* Render selected member detail card */}
      {showDetailCard && selectedSocio && (
        <SocioDetailCard
          socio={selectedSocio}
          planes={planes}
          onClose={() => {
            setShowDetailCard(false);
            setSelectedSocio(null);
          }}
          onRefresh={() => {
            loadData();
          }}
        />
      )}

      {/* Dynamic Toast Alerts */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 10001,
          background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'success' ? '#22c55e' : '#ef4444'}50`,
          borderRadius: '12px', padding: '14px 20px', color: toast.type === 'success' ? '#22c55e' : '#ef4444',
          fontWeight: '600', fontSize: '14px', backdropFilter: 'blur(8px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>{toast.msg}</div>
      )}
    </div>
  );
};
