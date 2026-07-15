import React, { useState } from 'react';
import type { CajaBalance } from '../../../../data/apiService';

// ==========================================
// 1. ABRIR CAJA MODAL
// ==========================================
interface AbrirCajaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (montoApertura: string, comentario: string) => Promise<void>;
  loading: boolean;
  errorMsg: string;
}

export const AbrirCajaModal: React.FC<AbrirCajaModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  loading,
  errorMsg,
}) => {
  const [montoApertura, setMontoApertura] = useState('100.00');
  const [comentarioCaja, setComentarioCaja] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(montoApertura, comentarioCaja);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm glass-panel border border-white/10 rounded-3xl p-6 relative shadow-2xl bg-[#141226]/95">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
          <h3 className="text-sm font-black text-white uppercase tracking-tight">Apertura de Turno de Caja</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Monto de Apertura (S/)</label>
            <input
              type="number"
              step="0.10"
              required
              value={montoApertura}
              onChange={(e) => setMontoApertura(e.target.value)}
              className="w-full bg-[#1a1c36] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Comentario / Observación</label>
            <input
              type="text"
              value={comentarioCaja}
              onChange={(e) => setComentarioCaja(e.target.value)}
              placeholder="Ej. Caja chica de recepción..."
              className="w-full bg-[#1a1c36] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
            />
          </div>

          {errorMsg && <p className="text-[10px] text-rose-500 font-bold uppercase">{errorMsg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-strong text-slate-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            {loading ? 'Guardando...' : 'Confirmar Apertura'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 2. CERRAR CAJA MODAL
// ==========================================
interface CerrarCajaModalProps {
  isOpen: boolean;
  cajaBalance: CajaBalance | null;
  onClose: () => void;
  onSubmit: (montoCierreReal: string, comentario: string) => Promise<void>;
  loading: boolean;
  errorMsg: string;
}

export const CerrarCajaModal: React.FC<CerrarCajaModalProps> = ({
  isOpen,
  cajaBalance,
  onClose,
  onSubmit,
  loading,
  errorMsg,
}) => {
  const [montoCierreReal, setMontoCierreReal] = useState('');
  const [comentarioCaja, setComentarioCaja] = useState('');

  if (!isOpen || !cajaBalance) return null;

  const totalMembresias =
    cajaBalance.membresiasEfectivo +
    cajaBalance.membresiasYape +
    cajaBalance.membresiasPlin +
    cajaBalance.membresiasTransferencia +
    cajaBalance.membresiasTarjeta +
    cajaBalance.membresiasMixto;

  const totalBarFit =
    cajaBalance.barFitEfectivo +
    cajaBalance.barFitYape +
    cajaBalance.barFitPlin +
    cajaBalance.barFitTransferencia +
    cajaBalance.barFitTarjeta +
    cajaBalance.barFitMixto;

  const totalVentas = totalMembresias + totalBarFit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(montoCierreReal, comentarioCaja);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm glass-panel border border-white/10 rounded-3xl p-6 relative shadow-2xl bg-[#141226]/95">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
          <h3 className="text-sm font-black text-white uppercase tracking-tight">Cierre y Arqueo de Caja</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-[#1a1c36]/60 border border-white/5 rounded-xl text-[11px] space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>💵 Monto de Apertura:</span>
              <span className="text-white font-mono font-bold">{cajaBalance.montoApertura.toFixed(2)} S/</span>
            </div>
            
            <div className="flex justify-between text-slate-300">
              <span>💳 Ventas de Membresías:</span>
              <span className="text-white font-mono font-semibold">+{totalMembresias.toFixed(2)} S/</span>
            </div>
            
            <div className="flex justify-between text-slate-300">
              <span>🥤 Ventas Bar Fit & Clases:</span>
              <span className="text-white font-mono font-semibold">+{totalBarFit.toFixed(2)} S/</span>
            </div>

            {cajaBalance.ingresosManuales > 0 && (
              <div className="flex justify-between text-slate-300 text-[10px]">
                <span>📥 Ingresos Manuales:</span>
                <span className="text-emerald-400 font-mono">+{cajaBalance.ingresosManuales.toFixed(2)} S/</span>
              </div>
            )}

            {cajaBalance.egresosManuales > 0 && (
              <div className="flex justify-between text-slate-300 text-[10px]">
                <span>📤 Egresos Manuales:</span>
                <span className="text-rose-400 font-mono">-{cajaBalance.egresosManuales.toFixed(2)} S/</span>
              </div>
            )}

            <div className="flex justify-between text-slate-300 border-t border-white/5 pt-2 mt-2 font-bold">
              <span>Total Ventas Recaudado:</span>
              <span className="text-white font-mono font-bold">+{totalVentas.toFixed(2)} S/</span>
            </div>

            <div className="flex justify-between text-slate-300 border-t border-white/10 pt-2 mt-2">
              <span className="font-black text-white uppercase text-xs">Total Esperado en Caja:</span>
              <span className="text-brand-green font-mono font-black text-xs">{cajaBalance.totalTeorico.toFixed(2)} S/</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Monto de Cierre Real en Efectivo (S/)</label>
            <input
              type="number"
              step="0.10"
              required
              placeholder="Ingrese el monto físico contado en caja"
              value={montoCierreReal}
              onChange={(e) => setMontoCierreReal(e.target.value)}
              className="w-full bg-[#1a1c36] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Comentario / Diferencias</label>
            <input
              type="text"
              value={comentarioCaja}
              onChange={(e) => setComentarioCaja(e.target.value)}
              placeholder="Ej. Todo cuadrado..."
              className="w-full bg-[#1a1c36] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
            />
          </div>

          {errorMsg && <p className="text-[10px] text-rose-500 font-bold uppercase">{errorMsg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            {loading ? 'Guardando...' : 'Confirmar Cierre de Caja'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 3. ARQUEO CAJA MODAL (Desglose de Formas de Pago)
// ==========================================
interface ArqueoCajaModalProps {
  isOpen: boolean;
  cajaBalance: CajaBalance | null;
  onClose: () => void;
}

export const ArqueoCajaModal: React.FC<ArqueoCajaModalProps> = ({
  isOpen,
  cajaBalance,
  onClose,
}) => {
  if (!isOpen || !cajaBalance) return null;

  const totalVentas =
    (cajaBalance.membresiasEfectivo +
     cajaBalance.membresiasYape +
     cajaBalance.membresiasPlin +
     cajaBalance.membresiasTransferencia +
     cajaBalance.membresiasTarjeta +
     cajaBalance.membresiasMixto +
     cajaBalance.barFitEfectivo +
     cajaBalance.barFitYape +
     cajaBalance.barFitPlin +
     cajaBalance.barFitTransferencia +
     cajaBalance.barFitTarjeta +
     cajaBalance.barFitMixto);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm glass-panel border border-white/10 rounded-3xl p-6 relative shadow-2xl bg-[#141226]/95 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-sm font-black text-white uppercase tracking-tight">Arqueo Desglosado de Turno</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>

        <div className="space-y-4 text-xs max-h-[380px] overflow-y-auto scrollbar-thin">
          {/* Cash breakdown */}
          <div className="bg-[#1a1c36]/40 border border-white/5 rounded-2xl p-3.5 space-y-2">
            <h4 className="text-[10px] font-black uppercase text-brand-green tracking-wider flex items-center gap-1">💵 Efectivo Físico</h4>
            <div className="flex justify-between text-slate-300">
              <span>Fondo Inicial:</span>
              <span className="text-white font-mono">+{cajaBalance.montoApertura.toFixed(2)} S/</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Membresías en Efectivo:</span>
              <span className="text-white font-mono">+{cajaBalance.membresiasEfectivo.toFixed(2)} S/</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Bar Fit / Clases en Efectivo:</span>
              <span className="text-white font-mono">+{cajaBalance.barFitEfectivo.toFixed(2)} S/</span>
            </div>
            {cajaBalance.ingresosManuales > 0 && (
              <div className="flex justify-between text-slate-300">
                <span>Ingresos Manuales:</span>
                <span className="text-emerald-400 font-mono">+{cajaBalance.ingresosManuales.toFixed(2)} S/</span>
              </div>
            )}
            {cajaBalance.egresosManuales > 0 && (
              <div className="flex justify-between text-slate-300">
                <span>Egresos Manuales:</span>
                <span className="text-rose-400 font-mono">-{cajaBalance.egresosManuales.toFixed(2)} S/</span>
              </div>
            )}
            <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1.5 font-bold text-white">
              <span>Efectivo Total a Contar:</span>
              <span className="text-brand-green font-mono">{cajaBalance.totalEfectivo.toFixed(2)} S/</span>
            </div>
          </div>

          {/* Digital breakdown */}
          <div className="bg-[#1a1c36]/40 border border-white/5 rounded-2xl p-3.5 space-y-2">
            <h4 className="text-[10px] font-black uppercase text-accent-cyan tracking-wider flex items-center gap-1">📱 Canales Digitales</h4>
            <div className="flex justify-between text-slate-300">
              <span>Yape (Celular):</span>
              <span className="text-white font-mono">{cajaBalance.totalYape.toFixed(2)} S/</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Plin (Celular):</span>
              <span className="text-white font-mono">{cajaBalance.totalPlin.toFixed(2)} S/</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Transferencia Bancaria:</span>
              <span className="text-white font-mono">{cajaBalance.totalTransferencia.toFixed(2)} S/</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Tarjeta (POS Visa/MC):</span>
              <span className="text-white font-mono">{cajaBalance.totalTarjeta.toFixed(2)} S/</span>
            </div>
            {cajaBalance.totalMixto > 0 && (
              <div className="flex justify-between text-slate-300">
                <span>Pago Mixto:</span>
                <span className="text-white font-mono">{cajaBalance.totalMixto.toFixed(2)} S/</span>
              </div>
            )}
            <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1.5 font-bold text-white">
              <span>Total Canales Digitales:</span>
              <span className="text-accent-cyan font-mono">
                {(cajaBalance.totalYape + cajaBalance.totalPlin + cajaBalance.totalTransferencia + cajaBalance.totalTarjeta + cajaBalance.totalMixto).toFixed(2)} S/
              </span>
            </div>
          </div>

          {/* Overall Summary */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Total Ventas Recaudado:</span>
              <span className="font-bold text-white">
                {totalVentas.toFixed(2)} S/
              </span>
            </div>
            <div className="flex justify-between text-sm font-black border-t border-white/5 pt-2 mt-2">
              <span className="text-white uppercase text-xs">Monto Total Teórico:</span>
              <span className="text-brand-green font-mono">{cajaBalance.totalTeorico.toFixed(2)} S/</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
        >
          Cerrar Vista
        </button>
      </div>
    </div>
  );
};
