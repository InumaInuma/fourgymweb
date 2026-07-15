import React from 'react';
import type { SocioConMembresia } from '../../../../data/apiService';

interface AccessValidationModalProps {
  socio: SocioConMembresia | null;
  onClose: () => void;
  onCheckin: (s: SocioConMembresia) => void;
  onViewProfile: (s: SocioConMembresia) => void;
}

export const AccessValidationModal: React.FC<AccessValidationModalProps> = ({
  socio,
  onClose,
  onCheckin,
  onViewProfile,
}) => {
  if (!socio) return null;

  const isActivo = socio.estadoSocio === 'Activo';
  const isCongelado = socio.estadoSocio === 'Congelado';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md glass-panel border border-white/10 rounded-3xl p-6 relative shadow-2xl bg-[#141226]/95 space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-sm font-black text-white uppercase tracking-tight">Validación de Control de Acceso</h3>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Status Visual Indicator Card */}
        <div className={`p-6 rounded-2xl border text-center space-y-3 ${
          isActivo
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : isCongelado
            ? 'bg-sky-500/10 border-sky-500/20 text-sky-400'
            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
        }`}>
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-white/5 shadow-inner">
            {isActivo ? '✓' : isCongelado ? '❄️' : '✕'}
          </div>
          <div>
            <h4 className="text-lg font-black uppercase tracking-wider">
              {isActivo ? 'Acceso Permitido' : 'Acceso Denegado'}
            </h4>
            <p className="text-xs font-semibold opacity-85 mt-0.5">
              Estado: Membresía {socio.estadoSocio}
            </p>
            {socio.montoDeuda && socio.montoDeuda > 0 ? (
              <div className="mt-2 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg p-2 animate-pulse">
                ⚠️ Saldo pendiente: S/ {socio.montoDeuda.toFixed(2)}
                {socio.diasRestantesPago !== undefined && (
                  <span className="block text-[10px] mt-0.5 opacity-90 font-semibold">
                    {socio.diasRestantesPago >= 0 
                      ? `Quedan ${socio.diasRestantesPago} días para cancelar` 
                      : `PAGO VENCIDO hace ${Math.abs(socio.diasRestantesPago)} días`}
                  </span>
                )}
              </div>
            ) : null}
          </div>
        </div>

        {/* Socio Info Table */}
        <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-4 space-y-3 text-xs">
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-text-secondary">Socio:</span>
            <span className="font-bold text-white text-right">
              {socio.nombre} {socio.apellidoPaterno} {socio.apellidoMaterno || ''}
            </span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-text-secondary">DNI:</span>
            <span className="font-mono text-white font-bold">{socio.numeroDocumento}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-text-secondary">Código de Socio:</span>
            <span className="font-mono text-white font-black">
              GYM-{String(socio.idSocio).padStart(6, '0')}
            </span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-text-secondary">Plan Contratado:</span>
            <span className="font-bold text-white">{socio.nombrePlan || '—'}</span>
          </div>
          {socio.montoDeuda && socio.montoDeuda > 0 ? (
            <>
              <div className="flex justify-between border-b border-white/5 pb-2 text-amber-400 font-bold">
                <span>Saldo Pendiente:</span>
                <span>S/ {socio.montoDeuda.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2 text-slate-300">
                <span>Límite de Pago:</span>
                <span className="font-mono">
                  {socio.fechaLimitePago 
                    ? new Date(socio.fechaLimitePago).toLocaleDateString('es-PE') 
                    : '—'}
                </span>
              </div>
            </>
          ) : null}
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="text-text-secondary">Fecha de Matrícula:</span>
            <span className="font-mono text-white">
              {socio.fechaInicioMembresia 
                ? new Date(socio.fechaInicioMembresia).toLocaleDateString('es-PE') 
                : '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Vence el:</span>
            <span className="font-mono text-white font-bold">
              {socio.fechaFinMembresia 
                ? new Date(socio.fechaFinMembresia).toLocaleDateString('es-PE') 
                : '—'}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={() => onCheckin(socio)}
            className="w-full py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-strong text-slate-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            ⚡ Registrar Entrada
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={() => onViewProfile(socio)}
              className="flex-grow py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
            >
              👁️ Ver Ficha & Renovar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
            >
              Cerrar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
