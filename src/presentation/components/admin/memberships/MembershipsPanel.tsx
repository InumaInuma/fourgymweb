import React, { useState, useEffect } from 'react';
import { apiService, type PlanMembresia, type SocioConMembresia } from '../../../../data/apiService';
import { SocioMatriculaModal } from './SocioMatriculaModal';
import { Toast } from '../../ui/Toast';

interface MembershipsPanelProps {
  currentUser: any;
}

export const MembershipsPanel: React.FC<MembershipsPanelProps> = ({ currentUser }) => {
  // Tabs: 'socios' | 'planes'
  const [subTab, setSubTab] = useState<'socios' | 'planes'>('socios');

  // Data states
  const [planes, setPlanes] = useState<PlanMembresia[]>([]);
  const [socios, setSocios] = useState<SocioConMembresia[]>([]);
  const [loadingPlanes, setLoadingPlanes] = useState(true);
  const [loadingSocios, setLoadingSocios] = useState(true);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Drawer/Modal states
  const [isSocioDrawerOpen, setIsSocioDrawerOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanMembresia | null>(null);

  // New Plan Form States
  const [planNombre, setPlanNombre] = useState('');
  const [planDuracionMeses, setPlanDuracionMeses] = useState<number>(1);
  const [planPrecio, setPlanPrecio] = useState<string>('');
  const [planActivo, setPlanActivo] = useState<boolean>(true);

  // Messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [toast, setToast] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Fetch all data
  const loadPlanes = async () => {
    try {
      setLoadingPlanes(true);
      const data = await apiService.getPlanesMembresias();
      setPlanes(data);
    } catch (err: any) {
      console.error('Error cargando planes de membresía:', err);
    } finally {
      setLoadingPlanes(false);
    }
  };

  const loadSocios = async () => {
    try {
      setLoadingSocios(true);
      const data = await apiService.getSociosConMembresias();
      setSocios(data);
    } catch (err: any) {
      console.error('Error cargando socios matriculados:', err);
    } finally {
      setLoadingSocios(false);
    }
  };

  useEffect(() => {
    loadPlanes();
    loadSocios();
  }, []);

  // Filtered members list
  const filteredSocios = socios.filter(s => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    const fullName = `${s.nombre} ${s.apellidoPaterno} ${s.apellidoMaterno}`.toLowerCase();
    return fullName.includes(search) || s.numeroDocumento.includes(search);
  });

  // Handle Save Socio
  const handleSaveSocio = async (payload: any) => {
    setErrorMsg('');
    setFormLoading(true);
    try {
      await apiService.registrarSocioConMembresia(payload);
      setToast({ tipo: 'success', texto: 'Socio registrado y matriculado con éxito.' });
      loadSocios();
      setIsSocioDrawerOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar el socio con su membresía.');
    } finally {
      setFormLoading(false);
    }
  };

  // Plan creation / modification
  const openCreatePlanModal = () => {
    setEditingPlan(null);
    setPlanNombre('');
    setPlanDuracionMeses(1);
    setPlanPrecio('');
    setPlanActivo(true);
    setErrorMsg('');
    setSuccessMsg('');
    setIsPlanModalOpen(true);
  };

  const openEditPlanModal = (plan: PlanMembresia) => {
    setEditingPlan(plan);
    setPlanNombre(plan.nombre);
    setPlanDuracionMeses(plan.duracionMeses);
    setPlanPrecio(plan.precio.toString());
    setPlanActivo(plan.activo);
    setErrorMsg('');
    setSuccessMsg('');
    setIsPlanModalOpen(true);
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!planNombre.trim()) {
      setErrorMsg('El nombre del plan es requerido.');
      return;
    }
    const precio = parseFloat(planPrecio);
    if (isNaN(precio) || precio <= 0) {
      setErrorMsg('El precio debe ser un número válido mayor a 0.');
      return;
    }

    try {
      setFormLoading(true);
      if (editingPlan) {
        // Update Plan
        await apiService.actualizarPlanMembresia(editingPlan.id, {
          id: editingPlan.id,
          nombre: planNombre.trim(),
          duracionMeses: planDuracionMeses,
          precio: precio,
          activo: planActivo
        });
        setToast({ tipo: 'success', texto: 'Plan de membresía actualizado con éxito.' });
      } else {
        // Create Plan
        await apiService.crearPlanMembresia({
          nombre: planNombre.trim(),
          duracionMeses: planDuracionMeses,
          precio: precio
        });
        setToast({ tipo: 'success', texto: 'Plan de membresía registrado con éxito.' });
      }

      await loadPlanes();
      setIsPlanModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar el plan de membresía.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Selector */}
      <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-brand-green rounded-full"></span>
            Gestión de Membresías y Matrículas
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Administra los planes de suscripción y matricula nuevos socios garantizando que puedan completar su onboarding digital de forma segura.
          </p>
        </div>

        <div className="flex bg-[#263238]/60 p-1 rounded-xl border border-white/5 self-start sm:self-auto font-bold">
          <button
            type="button"
            onClick={() => setSubTab('socios')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-wider cursor-pointer flex items-center gap-1.5 ${
              subTab === 'socios'
                ? 'bg-brand-green text-slate-950 shadow-md shadow-brand-green/15 font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
            Socios Matriculados
          </button>
          <button
            type="button"
            onClick={() => setSubTab('planes')}
            className={`px-4 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-wider cursor-pointer flex items-center gap-1.5 ${
              subTab === 'planes'
                ? 'bg-accent-cyan text-slate-950 shadow-md shadow-accent-cyan/15'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3m-3-6h10.5m-12.75 3h15a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-15A2.25 2.25 0 012.25 18v-9a2.25 2.25 0 012.25-2.25z" />
            </svg>
            Planes de Membresía
          </button>
        </div>
      </div>

      {/* SUBTAB 1: SOCIOS MATRICULADOS */}
      {subTab === 'socios' && (
        <div className="space-y-4">
          {/* Controls row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:max-w-xs">
              <input
                type="text"
                placeholder="Buscar por DNI o Nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#263238]/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent-cyan transition-all"
              />
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3.5 top-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Action button */}
            <button
              onClick={() => {
                setErrorMsg('');
                setSuccessMsg('');
                setIsSocioDrawerOpen(true);
              }}
              className="px-5 py-2.5 bg-brand-green hover:bg-brand-green-strong text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 self-start sm:self-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Registrar Nuevo Socio
            </button>
          </div>

          {/* Table Container */}
          <div className="glass-card overflow-hidden border border-white/5 rounded-3xl p-0">
            {loadingSocios ? (
              <div className="text-center py-16 text-slate-400 text-xs font-bold">Cargando listado de socios...</div>
            ) : filteredSocios.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-sm font-medium">
                No se encontraron socios matriculados.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 bg-slate-950/25 text-[10px] text-text-secondary font-black uppercase tracking-wider">
                      <th className="px-6 py-4">Socio / DNI</th>
                      <th className="px-6 py-4">Celular</th>
                      <th className="px-6 py-4">Edad</th>
                      <th className="px-6 py-4">Plan Adquirido</th>
                      <th className="px-6 py-4">Fecha Inicio</th>
                      <th className="px-6 py-4">Fecha Vence</th>
                      <th className="px-6 py-4 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs font-medium text-slate-200">
                    {filteredSocios.map((socio) => {
                      const today = new Date();
                      const expiryDateObj = socio.fechaFinMembresia ? new Date(socio.fechaFinMembresia) : null;
                      const isExpired = expiryDateObj ? expiryDateObj < today : true;
                      
                      return (
                        <tr
                          key={socio.idSocio}
                          className="hover:bg-white/5 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-bold text-white group-hover:text-accent-cyan transition-colors">
                                {`${socio.nombre} ${socio.apellidoPaterno} ${socio.apellidoMaterno}`.toUpperCase()}
                              </span>
                              <span className="text-[10px] text-text-secondary font-mono mt-0.5">
                                DNI: {socio.numeroDocumento}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-300 font-mono">
                            {socio.telefono || 'Sin celular'}
                          </td>
                          <td className="px-6 py-4 text-slate-300">
                            {socio.edad ? `${socio.edad} años` : 'No registrada'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-200">
                                {socio.nombrePlan || 'Plan Custom'}
                              </span>
                              <span className="text-[10px] text-text-secondary">
                                {socio.duracionMeses ? `${socio.duracionMeses} meses` : ''} • S/ {(socio.montoPagado || 0).toFixed(2)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-400 font-mono">
                            {socio.fechaInicioMembresia
                              ? new Date(socio.fechaInicioMembresia).toLocaleDateString('es-PE')
                              : '-'}
                          </td>
                          <td className="px-6 py-4 font-mono font-bold">
                            {socio.fechaFinMembresia ? (
                              <span className={isExpired ? 'text-rose-400' : 'text-emerald-400'}>
                                {new Date(socio.fechaFinMembresia).toLocaleDateString('es-PE')}
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                                isExpired
                                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              }`}
                            >
                              {isExpired ? 'Vencido' : 'Activo'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 2: PLANES DE MEMBRESÍA */}
      {subTab === 'planes' && (
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex justify-between items-center">
            <p className="text-xs text-text-secondary">
              Listado de paquetes y membresías vigentes. Haz clic en un plan para editar su precio.
            </p>
            <button
              onClick={openCreatePlanModal}
              className="px-4 py-2 bg-brand-green hover:bg-brand-green-strong text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nuevo Plan
            </button>
          </div>

          {/* Grid of Cards */}
          {loadingPlanes ? (
            <div className="text-center py-16 text-slate-400 text-xs font-bold">Cargando planes...</div>
          ) : planes.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-sm">
              No hay planes de membresía configurados. Crea uno nuevo.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {planes.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => openEditPlanModal(plan)}
                  className={`group bg-white/5 border hover:border-accent-cyan/40 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 rounded-3xl p-5 flex flex-col justify-between h-56 cursor-pointer relative overflow-hidden ${
                    plan.activo ? 'border-white/10' : 'border-rose-500/20 opacity-60'
                  }`}
                >
                  {/* Cyan Glow Effect on hover */}
                  <div className="absolute -right-12 -top-12 w-24 h-24 bg-accent-cyan/5 rounded-full blur-2xl group-hover:bg-accent-cyan/15 transition-all"></div>

                  <div className="relative z-10 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20 px-2 py-0.5 rounded-md">
                          Plan {plan.duracionMeses} {plan.duracionMeses === 1 ? 'Mes' : 'Meses'}
                        </span>
                        
                        <span
                          className={`inline-block w-2.5 h-2.5 rounded-full ${
                            plan.activo ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        ></span>
                      </div>

                      <h3 className="text-lg font-black text-white mt-4 tracking-tight group-hover:text-accent-cyan transition-colors leading-tight">
                        {plan.nombre}
                      </h3>
                      <p className="text-xs text-text-secondary mt-1">Duración: {plan.duracionMeses} {plan.duracionMeses === 1 ? 'mes completo' : 'meses completos'}</p>
                    </div>

                    <div className="border-t border-white/5 pt-4 mt-4 flex items-baseline justify-between">
                      <span className="text-xs text-text-secondary font-bold uppercase">Precio</span>
                      <span className="text-2xl font-black text-white font-mono tracking-tight">
                        S/ {plan.precio.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Centered Modal: Registrar Socio */}
      <SocioMatriculaModal
        isOpen={isSocioDrawerOpen}
        onClose={() => setIsSocioDrawerOpen(false)}
        planes={planes}
        onSave={handleSaveSocio}
        formLoading={formLoading}
        errorMsg={errorMsg}
      />

      {/* MODAL: NUEVO / EDITAR PLAN */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm glass-panel border border-white/10 rounded-3xl p-6 relative shadow-2xl bg-[#141226]/95">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <h3 className="text-sm font-black text-white uppercase tracking-tight">
                {editingPlan ? 'Modificar Plan de Membresía' : 'Crear Plan de Membresía'}
              </h3>
              <button
                disabled={formLoading}
                onClick={() => setIsPlanModalOpen(false)}
                className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handlePlanSubmit} className="space-y-4">
              {/* Nombre Plan */}
              <div>
                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">
                  Nombre del Plan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Membresía 3 Meses"
                  value={planNombre}
                  onChange={(e) => setPlanNombre(e.target.value)}
                  className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green"
                />
              </div>

              {/* Duración en Meses */}
              <div>
                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">
                  Duración (Meses)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={60}
                  placeholder="Ej. 3"
                  value={planNombre ? planDuracionMeses : 1}
                  onChange={(e) => setPlanDuracionMeses(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green font-mono"
                />
              </div>

              {/* Precio del Plan */}
              <div>
                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">
                  Precio de Lista (S/)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ej. 250.00"
                  value={planPrecio}
                  onChange={(e) => setPlanPrecio(e.target.value)}
                  className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green font-mono"
                />
              </div>

              {/* Activo (Only when editing) */}
              {editingPlan && (
                <div className="flex items-center justify-between px-4 py-3 bg-[#263238]/30 border border-white/5 rounded-xl">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-tight">Estado Activo</span>
                  <input
                    type="checkbox"
                    checked={planActivo}
                    onChange={(e) => setPlanActivo(e.target.checked)}
                    className="w-4 h-4 accent-brand-green cursor-pointer"
                  />
                </div>
              )}

              {/* Status messages */}
              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={formLoading}
                className="mt-2 w-full py-3 bg-brand-green hover:bg-brand-green-strong text-slate-950 font-black rounded-xl uppercase tracking-wider text-xs transition-colors cursor-pointer flex justify-center items-center"
              >
                {formLoading ? 'Guardando...' : editingPlan ? 'Guardar Cambios' : 'Crear Plan'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Dynamic Toast Alert Portal */}
      <Toast
        mensaje={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
};
