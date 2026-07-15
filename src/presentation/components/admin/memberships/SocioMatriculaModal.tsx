import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import type { PlanMembresia, FormaPago } from '../../../../data/apiService';
import { apiService } from '../../../../data/apiService';

interface SocioMatriculaModalProps {
  isOpen: boolean;
  onClose: () => void;
  planes: PlanMembresia[];
  onSave: (payload: any) => Promise<void>;
  formLoading: boolean;
  errorMsg: string;
}

export const SocioMatriculaModal: React.FC<SocioMatriculaModalProps> = ({
  isOpen,
  onClose,
  planes,
  onSave,
  formLoading,
  errorMsg,
}) => {
  const [dni, setDni] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<number | ''>('');
  const [precioPagado, setPrecioPagado] = useState<string>('');
  const [isCustomPrice, setIsCustomPrice] = useState(false);
  const [formasPago, setFormasPago] = useState<FormaPago[]>([]);
  const [selectedFormaPagoId, setSelectedFormaPagoId] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch Formas de Pago once
  useEffect(() => {
    if (isOpen) {
      apiService.getFormasPago()
        .then(data => {
          setFormasPago(data);
          if (data.length > 0) {
            setSelectedFormaPagoId(data[0].id);
          }
        })
        .catch(err => console.error('Error al cargar formas de pago', err));
    }
  }, [isOpen]);

  // Reset fields when opening modal
  useEffect(() => {
    if (isOpen) {
      setDni('');
      setNombre('');
      setApellidoPaterno('');
      setApellidoMaterno('');
      setTelefono('');
      setFechaNacimiento('');
      setErrors({});
      
      const activePlanes = planes.filter(p => p.activo);
      if (activePlanes.length > 0) {
        setSelectedPlanId(activePlanes[0].id);
        setPrecioPagado(activePlanes[0].precio.toString());
      } else {
        setSelectedPlanId('');
        setPrecioPagado('');
      }
      setIsCustomPrice(false);
    }
  }, [isOpen, planes]);

  // Sync plan price when plan selection changes, unless the admin manually wrote a custom price
  useEffect(() => {
    if (selectedPlanId !== '' && !isCustomPrice) {
      const plan = planes.find(p => p.id === selectedPlanId);
      if (plan) {
        setPrecioPagado(plan.precio.toString());
      }
    }
  }, [selectedPlanId, isCustomPrice, planes]);

  // Calculate age
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

  // Calculate expiration date
  const expirationDate = selectedPlanId !== '' ? (() => {
    const plan = planes.find(p => p.id === selectedPlanId);
    if (!plan) return '';
    const d = new Date();
    d.setMonth(d.getMonth() + plan.duracionMeses);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  })() : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tempErrors: Record<string, string> = {};

    if (!dni || dni.length < 8) {
      tempErrors.dni = '• EL DNI DEBE TENER AL MENOS 8 DÍGITOS';
    }
    if (!nombre) {
      tempErrors.nombre = '• CAMPO REQUERIDO';
    }
    if (!apellidoPaterno) {
      tempErrors.apellidoPaterno = '• CAMPO REQUERIDO';
    }
    if (!apellidoMaterno) {
      tempErrors.apellidoMaterno = '• CAMPO REQUERIDO';
    }
    if (!telefono) {
      tempErrors.telefono = '• CAMPO REQUERIDO';
    }
    if (!fechaNacimiento) {
      tempErrors.fechaNacimiento = '• CAMPO REQUERIDO';
    } else {
      const birthDateObj = new Date(fechaNacimiento);
      if (birthDateObj >= new Date()) {
        tempErrors.fechaNacimiento = '• LA FECHA DEBE SER PASADA';
      }
    }
    if (selectedPlanId === '') {
      tempErrors.selectedPlanId = '• DEBE SELECCIONAR UN PLAN';
    }
    
    const precio = parseFloat(precioPagado);
    if (isNaN(precio) || precio < 0) {
      tempErrors.precioPagado = '• EL PRECIO DEBE SER VÁLIDO';
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    setErrors({});
    onSave({
      nombre: nombre.trim(),
      apellidoPaterno: apellidoPaterno.trim(),
      apellidoMaterno: apellidoMaterno.trim(),
      numeroDocumento: dni.trim(),
      idTipoDocumento: 1, // DNI
      telefono: telefono.trim(),
      fechaNacimiento: fechaNacimiento,
      idPlanMembresia: selectedPlanId,
      precioPagado: precio,
      idFormaPago: selectedFormaPagoId
    });
  };

  const renderFieldError = (field: string) => {
    if (!errors[field]) return null;
    return (
      <p className="text-[10px] font-black text-rose-500 mt-2 px-1 uppercase tracking-tighter flex items-center gap-1.5 animate-pulse">
        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
        {errors[field]}
      </p>
    );
  };

  const getInputClass = (field: string) => {
    const base = "w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-all";
    const status = errors[field]
      ? "border-rose-500/50 focus:border-rose-500 focus:ring-rose-500/5"
      : "border-white/10 focus:border-accent-cyan";
    return `${base} ${status}`;
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] overflow-hidden flex items-center justify-center p-4 md:p-6">
      {/* Backdrop blur overlay */}
      <div
        className="absolute inset-0 bg-[#07060f]/75 backdrop-blur-md transition-opacity"
        onClick={() => !formLoading && onClose()}
      ></div>

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-[#110f22]/95 border border-white/10 text-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-green/10 border border-brand-green/20 flex items-center justify-center text-brand-green shrink-0">
              <svg className="w-6 h-6 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-9-4.5a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5h10.5a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0015 4.5H4.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-white">
                Matricular Nuevo Socio
              </h3>
              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-0.5">
                Formulario Oficial de Inscripción y Membresía
              </p>
            </div>
          </div>
          
          <button
            disabled={formLoading}
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* DNI */}
            <div>
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-1">
                DNI / Documento de Identidad *
              </label>
              <input
                type="text"
                placeholder="Ingrese número de DNI (ej. 77889900)"
                maxLength={15}
                value={dni}
                onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                disabled={formLoading}
                className={getInputClass('dni')}
              />
              {renderFieldError('dni')}
            </div>

            {/* Nombres */}
            <div>
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-1">
                Nombres *
              </label>
              <input
                type="text"
                placeholder="Nombres del socio"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={formLoading}
                className={getInputClass('nombre')}
              />
              {renderFieldError('nombre')}
            </div>

            {/* Apellido Paterno */}
            <div>
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-1">
                Apellido Paterno *
              </label>
              <input
                type="text"
                placeholder="Apellido paterno del socio"
                value={apellidoPaterno}
                onChange={(e) => setApellidoPaterno(e.target.value)}
                disabled={formLoading}
                className={getInputClass('apellidoPaterno')}
              />
              {renderFieldError('apellidoPaterno')}
            </div>

            {/* Apellido Materno */}
            <div>
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-1">
                Apellido Materno *
              </label>
              <input
                type="text"
                placeholder="Apellido materno del socio"
                value={apellidoMaterno}
                onChange={(e) => setApellidoMaterno(e.target.value)}
                disabled={formLoading}
                className={getInputClass('apellidoMaterno')}
              />
              {renderFieldError('apellidoMaterno')}
            </div>

            {/* Celular / Teléfono */}
            <div>
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-1">
                Celular / Teléfono *
              </label>
              <input
                type="text"
                placeholder="Ej: 999888777"
                maxLength={15}
                value={telefono}
                onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
                disabled={formLoading}
                className={getInputClass('telefono')}
              />
              {renderFieldError('telefono')}
            </div>

            {/* Fecha de Nacimiento */}
            <div>
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-1">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                value={fechaNacimiento}
                onChange={(e) => setFechaNacimiento(e.target.value)}
                disabled={formLoading}
                className={getInputClass('fechaNacimiento')}
              />
              {renderFieldError('fechaNacimiento')}
            </div>
          </div>

          {/* Age Indicator Banner */}
          {age !== null && (
            <div className="px-4 py-3 bg-slate-950/40 border border-white/5 rounded-2xl text-[10px] font-bold text-slate-300 flex justify-between items-center">
              <span>Edad calculada del socio:</span>
              <span className="text-brand-green font-black font-mono text-xs">{age} años</span>
            </div>
          )}

          {/* Plan de Membresía */}
          <div>
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-1">
              Plan de Membresía Inicial *
            </label>
            <select
              value={selectedPlanId}
              onChange={(e) => {
                setSelectedPlanId(e.target.value === '' ? '' : parseInt(e.target.value, 10));
                setIsCustomPrice(false);
              }}
              disabled={formLoading}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#110f22]">-- SELECCIONE UN PLAN --</option>
              {planes.filter(p => p.activo).map((p) => (
                <option key={p.id} value={p.id} className="bg-[#110f22]">
                  {p.nombre.toUpperCase()} ({p.duracionMeses} {p.duracionMeses === 1 ? 'MES' : 'MESES'} • S/ {p.precio.toFixed(2)})
                </option>
              ))}
            </select>
            {renderFieldError('selectedPlanId')}
          </div>

          {/* Forma de Pago */}
          <div>
            <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-1">
              Forma de Pago *
            </label>
            <select
              value={selectedFormaPagoId}
              onChange={(e) => setSelectedFormaPagoId(parseInt(e.target.value, 10))}
              disabled={formLoading}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green transition-all appearance-none cursor-pointer"
            >
              {formasPago.map((fp) => (
                <option key={fp.id} value={fp.id} className="bg-[#110f22]">
                  {fp.nombre.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Resumen Financiero y Vigencia */}
          {selectedPlanId !== '' && (
            <div className="bg-[#1a1c36]/60 border border-accent-cyan/10 rounded-2xl p-5 space-y-4 shadow-xl">
              <span className="text-[10px] font-black text-accent-cyan uppercase tracking-widest block border-b border-white/5 pb-2">
                Resumen Financiero y Vigencia de la Matrícula
              </span>

              <div className="flex justify-between items-center text-[11px] text-slate-300 font-bold">
                <span>Vencimiento estimado de la suscripción:</span>
                <span className="text-white font-black font-mono bg-[#263238]/60 px-3 py-1 rounded-xl border border-white/5">
                  {expirationDate}
                </span>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-black text-slate-300 uppercase tracking-tight">
                    Monto a Pagar Hoy (S/) *
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
                  value={precioPagado}
                  onChange={(e) => {
                    setPrecioPagado(e.target.value);
                    setIsCustomPrice(true);
                  }}
                  disabled={formLoading}
                  className="w-full bg-[#263238]/80 border border-accent-cyan/20 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-accent-cyan font-mono"
                />
                {renderFieldError('precioPagado')}
                <span className="text-[9px] text-text-secondary mt-1.5 block">
                  Costo de lista del plan: S/ {planes.find(p => p.id === selectedPlanId)?.precio.toFixed(2)}. 
                  Si ingresa un monto menor, se guardará como Pago Parcial con saldo pendiente.
                </span>
              </div>

              {/* Live Remaining Balance Calculation */}
              {(() => {
                const plan = planes.find(p => p.id === selectedPlanId);
                if (!plan) return null;
                const paid = parseFloat(precioPagado);
                if (isNaN(paid) || paid >= plan.precio) return null;
                const remaining = plan.precio - paid;
                const limitDate = new Date();
                limitDate.setDate(limitDate.getDate() + 15);
                const limitDateStr = limitDate.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
                return (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1.5 animate-fade-in">
                    <div className="flex justify-between items-center text-xs font-black text-amber-400 uppercase tracking-wider">
                      <span>Saldo Restante (Deuda):</span>
                      <span className="font-mono text-sm">S/ {remaining.toFixed(2)}</span>
                    </div>
                    <p className="text-[10px] text-amber-300 font-semibold leading-relaxed">
                      ⚠️ El socio deberá cancelar el monto restante de <strong>S/ {remaining.toFixed(2)}</strong> en un plazo máximo de <strong>15 días</strong> (fecha límite: <strong>{limitDateStr}</strong>).
                    </p>
                  </div>
                );
              })()}
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-semibold flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Footer */}
          <div className="border-t border-white/5 pt-5 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              disabled={formLoading}
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-wider text-slate-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-6 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-strong text-slate-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
            >
              {formLoading ? (
                <span>Registrando...</span>
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
        </form>
      </div>
    </div>,
    document.body
  );
};
