import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import type { Colaborador, Sucursal } from '../../../../data/apiService';

interface CollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaborator: Colaborador | null;
  onSave: (data: any) => Promise<void>;
  formLoading: boolean;
  errorMsg: string;
  sucursales: Sucursal[];
}

export const CollaboratorModal: React.FC<CollaboratorModalProps> = ({
  isOpen,
  onClose,
  collaborator,
  onSave,
  formLoading,
  errorMsg,
  sucursales,
}) => {
  const [nombre, setNombre] = useState<string>('');
  const [apellidoPaterno, setApellidoPaterno] = useState<string>('');
  const [apellidoMaterno, setApellidoMaterno] = useState<string>('');
  const [dni, setDni] = useState<string>('');
  const [telefono, setTelefono] = useState<string>('');
  const [correo, setCorreo] = useState<string>('');
  const [idRol, setIdRol] = useState<number>(6); // Default: Recepcionista
  const [idSucursal, setIdSucursal] = useState<number>(0); // 0 = Global
  const [activo, setActivo] = useState<boolean>(true);

  // Field validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const roles = [
    { id: 1, nombre: 'Administrador' },
    { id: 6, nombre: 'Recepcionista' },
    { id: 3, nombre: 'Instructor' },
    { id: 4, nombre: 'Trainer' },
    { id: 5, nombre: 'Nutricionista' }
  ];



  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (collaborator) {
        setNombre(collaborator.nombre);
        setApellidoPaterno(collaborator.apellidoPaterno);
        setApellidoMaterno(collaborator.apellidoMaterno);
        setDni(collaborator.numeroDocumento);
        setTelefono(collaborator.telefono || '');
        setCorreo(collaborator.correo || '');
        setIdRol(collaborator.idRol);
        setIdSucursal(collaborator.idSucursal || 0);
        setActivo(collaborator.activo);
      } else {
        setNombre('');
        setApellidoPaterno('');
        setApellidoMaterno('');
        setDni('');
        setTelefono('');
        setCorreo('');
        setIdRol(6);
        setIdSucursal(0);
        setActivo(true);
      }
    }
  }, [collaborator, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!collaborator) {
      if (!dni.trim()) {
        newErrors.dni = 'DNI / Documento requerido';
      } else if (!/^\d{8}$/.test(dni.trim())) {
        newErrors.dni = 'El DNI debe tener exactamente 8 dígitos numéricos';
      }
    }

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    if (!apellidoPaterno.trim()) {
      newErrors.apellidoPaterno = 'El apellido paterno es requerido';
    }

    if (!apellidoMaterno.trim()) {
      newErrors.apellidoMaterno = 'El apellido materno es requerido';
    }

    if (correo.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      newErrors.correo = 'Formato de correo electrónico no válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = collaborator
      ? {
          idSucursal: idSucursal > 0 ? idSucursal : undefined,
          nombre: nombre.trim(),
          apellidoPaterno: apellidoPaterno.trim(),
          apellidoMaterno: apellidoMaterno.trim(),
          telefono: telefono.trim() || undefined,
          correo: correo.trim() || undefined,
          idRol,
          activo
        }
      : {
          idSucursal: idSucursal > 0 ? idSucursal : undefined,
          nombre: nombre.trim(),
          apellidoPaterno: apellidoPaterno.trim(),
          apellidoMaterno: apellidoMaterno.trim(),
          numeroDocumento: dni.trim(),
          idTipoDocumento: 1,
          telefono: telefono.trim() || undefined,
          correo: correo.trim() || undefined,
          idRol
        };

    onSave(payload);
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
        
        {/* Header (Image 3 Style) */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-center justify-center text-accent-cyan shrink-0">
              <svg className="w-6 h-6 stroke-[2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-9-4.5a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5h10.5a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0015 4.5H4.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-black uppercase tracking-wider text-white">
                {collaborator ? 'Actualizar Colaborador' : 'Registrar Solicitud'}
              </h3>
              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-0.5">
                {collaborator ? 'Formulario Oficial de Modificación' : 'Formulario Oficial de Gestión'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={formLoading}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5" noValidate>
          
          {/* Form-level Error Banner (Image 2 style) */}
          {errorMsg && (
            <div className="flex justify-center pb-2">
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 font-black text-[10px] uppercase tracking-wider px-6 py-2 rounded-full flex items-center gap-2 max-w-full text-center">
                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shrink-0" />
                <span>ERROR: {errorMsg}</span>
              </div>
            </div>
          )}

          {/* Form Fields Grid layout (Image 3 Concept) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* DNI */}
            <div>
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-1">DNI / Documento *</label>
              <input
                type="text"
                placeholder="Número de DNI"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                disabled={!!collaborator || formLoading}
                className={getInputClass('dni')}
              />
              {renderFieldError('dni')}
            </div>

            {/* Nombre */}
            <div>
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-1">Nombres *</label>
              <input
                type="text"
                placeholder="Ej: Juan"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={formLoading}
                className={getInputClass('nombre')}
              />
              {renderFieldError('nombre')}
            </div>

            {/* Apellido Paterno */}
            <div>
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-1">Apellido Paterno *</label>
              <input
                type="text"
                placeholder="Ej: Perez"
                value={apellidoPaterno}
                onChange={(e) => setApellidoPaterno(e.target.value)}
                disabled={formLoading}
                className={getInputClass('apellidoPaterno')}
              />
              {renderFieldError('apellidoPaterno')}
            </div>

            {/* Apellido Materno */}
            <div>
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-1">Apellido Materno *</label>
              <input
                type="text"
                placeholder="Ej: Quispe"
                value={apellidoMaterno}
                onChange={(e) => setApellidoMaterno(e.target.value)}
                disabled={formLoading}
                className={getInputClass('apellidoMaterno')}
              />
              {renderFieldError('apellidoMaterno')}
            </div>

            {/* Teléfono */}
            <div>
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-1">Teléfono / Celular</label>
              <input
                type="text"
                placeholder="Ej: 999888777"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                disabled={formLoading}
                className={getInputClass('telefono')}
              />
              {renderFieldError('telefono')}
            </div>

            {/* Correo */}
            <div>
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-1">Correo Electrónico</label>
              <input
                type="email"
                placeholder="Ej: correo@fourgym.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                disabled={formLoading}
                className={getInputClass('correo')}
              />
              {renderFieldError('correo')}
            </div>

            {/* Rol */}
            <div>
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-1">Rol / Cargo *</label>
              <select
                value={idRol}
                onChange={(e) => setIdRol(parseInt(e.target.value))}
                disabled={formLoading}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent-cyan transition-all appearance-none cursor-pointer"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id} className="bg-[#110f22]">
                    {r.nombre.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Sucursal */}
            <div>
              <label className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block mb-1">Sede de Trabajo *</label>
              <select
                value={idSucursal}
                onChange={(e) => setIdSucursal(parseInt(e.target.value))}
                disabled={formLoading}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-accent-cyan transition-all appearance-none cursor-pointer"
              >
                <option value="0" className="bg-[#110f22]">ACCESO GLOBAL (TODAS)</option>
                {sucursales.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#110f22]">
                    {s.nombre.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Activo (Full width row) */}
            {collaborator && (
              <div className="md:col-span-2 flex items-center gap-3 pt-2 bg-white/[0.01] p-4 border border-white/5 rounded-2xl">
                <input
                  type="checkbox"
                  id="activo"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  disabled={formLoading}
                  className="w-4 h-4 accent-accent-cyan rounded cursor-pointer"
                />
                <label htmlFor="activo" className="text-xs text-white font-bold select-none cursor-pointer">
                  Colaborador Activo (Permite acceso al sistema)
                </label>
              </div>
            )}

          </div>

          {/* Footer Buttons (Centered row like image 3) */}
          <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={formLoading}
              className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all cursor-pointer min-w-[120px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-6 py-3 bg-accent-cyan hover:bg-cyan-400 text-slate-950 font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-accent-cyan/15 cursor-pointer flex items-center justify-center gap-2 min-w-[140px]"
            >
              {formLoading && <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>}
              {collaborator ? 'Guardar' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
