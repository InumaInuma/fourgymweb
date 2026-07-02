import React, { useState, useEffect } from 'react';
import { apiService, type PlanMembresia, type SocioConMembresia } from '../../../data/apiService';

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

  // Drawer states
  const [isSocioDrawerOpen, setIsSocioDrawerOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanMembresia | null>(null);

  // New Socio Form States
  const [dni, setDni] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<number | ''>('');
  const [precioPagado, setPrecioPagado] = useState<string>('');
  
  // Custom price status (whether the user overrode the default price)
  const [isCustomPrice, setIsCustomPrice] = useState(false);

  // New Plan Form States
  const [planNombre, setPlanNombre] = useState('');
  const [planDuracionMeses, setPlanDuracionMeses] = useState<number>(1);
  const [planPrecio, setPlanPrecio] = useState<string>('');
  const [planActivo, setPlanActivo] = useState<boolean>(true);

  // Messages
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Fetch all data
  const loadPlanes = async () => {
    try {
      setLoadingPlanes(true);
      const data = await apiService.getPlanesMembresias();
      setPlanes(data);
      if (data.length > 0 && selectedPlanId === '') {
        // Find default plan or select the first active one
        const activePlanes = data.filter(p => p.activo);
        if (activePlanes.length > 0) {
          setSelectedPlanId(activePlanes[0].id);
          setPrecioPagado(activePlanes[0].precio.toString());
        }
      }
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

  // Sync plan price when plan selection changes, unless the admin manually wrote a custom price
  useEffect(() => {
    if (selectedPlanId !== '' && !isCustomPrice) {
      const plan = planes.find(p => p.id === selectedPlanId);
      if (plan) {
        setPrecioPagado(plan.precio.toString());
      }
    }
  }, [selectedPlanId, planes, isCustomPrice]);

  // Calculations
  const age = fechaNacimiento ? (() => {
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge;
  })() : null;

  const expirationDate = selectedPlanId !== '' ? (() => {
    const plan = planes.find(p => p.id === selectedPlanId);
    if (!plan) return '';
    const d = new Date();
    d.setMonth(d.getMonth() + plan.duracionMeses);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  })() : '';

  // Filtered members list
  const filteredSocios = socios.filter(s => {
    const search = searchTerm.toLowerCase().trim();
    if (!search) return true;
    const fullName = `${s.nombre} ${s.apellidoPaterno} ${s.apellidoMaterno}`.toLowerCase();
    return fullName.includes(search) || s.numeroDocumento.includes(search);
  });

  // Handle Socio Submit
  const handleSocioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!dni || dni.length < 8) {
      setErrorMsg('El DNI debe tener al menos 8 dígitos.');
      return;
    }
    if (!nombre || !apellidoPaterno || !apellidoMaterno) {
      setErrorMsg('Los nombres y apellidos son requeridos.');
      return;
    }
    if (!telefono) {
      setErrorMsg('El número de celular es requerido.');
      return;
    }
    if (!fechaNacimiento) {
      setErrorMsg('La fecha de nacimiento es requerida.');
      return;
    }
    const birthDateObj = new Date(fechaNacimiento);
    if (birthDateObj >= new Date()) {
      setErrorMsg('La fecha de nacimiento debe ser una fecha pasada.');
      return;
    }
    if (selectedPlanId === '') {
      setErrorMsg('Debe seleccionar un plan de membresía.');
      return;
    }
    const precio = parseFloat(precioPagado);
    if (isNaN(precio) || precio < 0) {
      setErrorMsg('El precio pagado debe ser un número válido mayor o igual a 0.');
      return;
    }

    try {
      setFormLoading(true);
      await apiService.registrarSocioConMembresia({
        nombre: nombre.trim(),
        apellidoPaterno: apellidoPaterno.trim(),
        apellidoMaterno: apellidoMaterno.trim(),
        numeroDocumento: dni.trim(),
        idTipoDocumento: 1, // DNI
        telefono: telefono.trim(),
        fechaNacimiento: fechaNacimiento,
        idPlanMembresia: selectedPlanId,
        precioPagado: precio
      });

      setSuccessMsg('Socio registrado y matriculado con éxito. Se le habilitará el acceso web con su DNI.');
      loadSocios();
      
      // Reset form states
      setDni('');
      setNombre('');
      setApellidoPaterno('');
      setApellidoMaterno('');
      setTelefono('');
      setFechaNacimiento('');
      setIsCustomPrice(false);
      
      // Close drawer after a delay
      setTimeout(() => {
        setIsSocioDrawerOpen(false);
        setSuccessMsg('');
      }, 2500);

    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar el socio con su membresía.');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle Plan Submit (Create/Update)
  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!planNombre) {
      setErrorMsg('El nombre del plan es requerido.');
      return;
    }
    if (planDuracionMeses <= 0) {
      setErrorMsg('La duración debe ser al menos de 1 mes.');
      return;
    }
    const precio = parseFloat(planPrecio);
    if (isNaN(precio) || precio < 0) {
      setErrorMsg('El precio debe ser un número válido mayor o igual a 0.');
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
          precio,
          activo: planActivo
        });
        setSuccessMsg('Plan de membresía actualizado con éxito.');
      } else {
        // Create Plan
        await apiService.crearPlanMembresia({
          nombre: planNombre.trim(),
          duracionMeses: planDuracionMeses,
          precio
        });
        setSuccessMsg('Plan de membresía creado con éxito.');
      }

      loadPlanes();
      
      // Reset form states
      setPlanNombre('');
      setPlanDuracionMeses(1);
      setPlanPrecio('');
      setPlanActivo(true);
      setEditingPlan(null);

      setTimeout(() => {
        setIsPlanModalOpen(false);
        setSuccessMsg('');
      }, 2000);

    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar el plan de membresía.');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditPlanModal = (plan: PlanMembresia) => {
    setEditingPlan(plan);
    setPlanNombre(plan.nombre);
    setPlanDuracionMeses(plan.duracionMeses);
    setPlanPrecio(plan.precio.toString());
    setPlanActivo(plan.activo);
    setIsPlanModalOpen(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const openCreatePlanModal = () => {
    setEditingPlan(null);
    setPlanNombre('');
    setPlanDuracionMeses(1);
    setPlanPrecio('');
    setPlanActivo(true);
    setIsPlanModalOpen(true);
    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation header */}
      <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-accent-cyan rounded-full"></span>
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
                ? 'bg-accent-cyan text-slate-950 shadow-md shadow-accent-cyan/15'
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
                                {socio.duracionMeses ? `${socio.duracionMeses} meses` : ''} • S/ {(socio.precioPagado || 0).toFixed(2)}
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

      {/* DRAWER: REGISTRAR SOCIO */}
      {isSocioDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => {
              if (!formLoading) setIsSocioDrawerOpen(false);
            }}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm transition-opacity"
          ></div>

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-[#141226]/95 border-l border-white/10 h-full shadow-2xl p-6 flex flex-col justify-between z-50 overflow-y-auto transform transition-transform">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-brand-green rounded-full"></span>
                    Matricular Nuevo Socio
                  </h3>
                  <p className="text-[10px] text-text-secondary mt-0.5">Ingrese los datos básicos del socio para activar su membresía.</p>
                </div>
                <button
                  disabled={formLoading}
                  onClick={() => setIsSocioDrawerOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Drawer Form */}
              <div className="space-y-5">
                {/* DNI */}
                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1.5">
                    DNI / Documento de Identidad
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={15}
                    placeholder="Ingrese número de DNI (ej. 77889900)"
                    value={dni}
                    onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green font-mono"
                  />
                </div>

                {/* Nombres */}
                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1.5">
                    Nombres
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nombres del socio"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green"
                  />
                </div>

                {/* Apellidos Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1.5">
                      Apellido Paterno
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Paterno"
                      value={apellidoPaterno}
                      onChange={(e) => setApellidoPaterno(e.target.value)}
                      className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1.5">
                      Apellido Materno
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Materno"
                      value={apellidoMaterno}
                      onChange={(e) => setApellidoMaterno(e.target.value)}
                      className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green"
                    />
                  </div>
                </div>

                {/* Celular y Fecha de Nacimiento Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1.5">
                      Celular / Teléfono
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={15}
                      placeholder="Ej. 999888777"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1.5">
                      Fec. Nacimiento
                    </label>
                    <input
                      type="date"
                      required
                      value={fechaNacimiento}
                      onChange={(e) => setFechaNacimiento(e.target.value)}
                      className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green text-slate-300 font-mono"
                    />
                  </div>
                </div>

                {/* Calculated Age indicator */}
                {age !== null && (
                  <div className="px-4 py-2 bg-slate-950/40 border border-white/5 rounded-xl text-[10px] font-bold text-slate-300 flex justify-between items-center">
                    <span>Edad calculada del socio:</span>
                    <span className="text-brand-green font-black font-mono text-xs">{age} años</span>
                  </div>
                )}

                {/* Plan Membresia Selection */}
                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1.5">
                    Plan de Membresía Inicial
                  </label>
                  <select
                    required
                    value={selectedPlanId}
                    onChange={(e) => {
                      setSelectedPlanId(e.target.value === '' ? '' : parseInt(e.target.value, 10));
                      setIsCustomPrice(false); // Reset custom price flag when plan changes
                    }}
                    className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green"
                  >
                    <option value="">-- Seleccione un plan --</option>
                    {planes.filter(p => p.activo).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre} ({p.duracionMeses} {p.duracionMeses === 1 ? 'Mes' : 'Meses'} • S/ {p.precio.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Finanzas / Resumen Financiero */}
                {selectedPlanId !== '' && (
                  <div className="bg-[#1a1c36] border border-accent-cyan/10 rounded-2xl p-4 space-y-3 shadow-inner">
                    <span className="text-[9px] font-black text-accent-cyan uppercase tracking-widest block border-b border-white/5 pb-1.5">
                      Resumen Financiero y Vigencia
                    </span>

                    {/* Vencimiento calculado */}
                    <div className="flex justify-between items-center text-[10px] text-slate-300 font-bold">
                      <span>Vencimiento estimado:</span>
                      <span className="text-white font-black font-mono bg-[#263238]/60 px-2 py-0.5 rounded-lg border border-white/5">
                        {expirationDate}
                      </span>
                    </div>

                    {/* Custom price field */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-tight">
                          Precio Cobrado (S/)
                        </label>
                        {isCustomPrice && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsCustomPrice(false);
                              const plan = planes.find(p => p.id === selectedPlanId);
                              if (plan) setPrecioPagado(plan.precio.toString());
                            }}
                            className="text-[9px] text-accent-cyan hover:underline font-black uppercase cursor-pointer"
                          >
                            Restaurar Precio Plan
                          </button>
                        )}
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={precioPagado}
                        onChange={(e) => {
                          setPrecioPagado(e.target.value);
                          setIsCustomPrice(true);
                        }}
                        className="w-full bg-[#263238]/80 border border-accent-cyan/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-cyan font-mono"
                      />
                      <span className="text-[8px] text-text-secondary mt-1 block">
                        Permite sobreescribir el precio de lista para aplicar descuentos especiales.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer / Submit */}
            <div className="mt-8 border-t border-white/5 pt-4 space-y-4">
              {errorMsg && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{successMsg}</span>
                </div>
              )}

              <button
                type="button"
                disabled={formLoading}
                onClick={handleSocioSubmit}
                className="w-full py-3.5 px-6 bg-brand-green hover:bg-brand-green-strong text-slate-950 font-black rounded-xl uppercase tracking-wider text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {formLoading ? (
                  <span>Registrando Socio...</span>
                ) : (
                  <>
                    <span>Confirmar Matrícula</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
                  value={planDuracionMeses}
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
    </div>
  );
};
