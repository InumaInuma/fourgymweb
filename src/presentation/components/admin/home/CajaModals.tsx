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
              className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Comentario / Observación</label>
            <input
              type="text"
              value={comentarioCaja}
              onChange={(e) => setComentarioCaja(e.target.value)}
              placeholder="Ej. Caja chica de recepción..."
              className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
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

  const totalVentas = 
    cajaBalance.totalEfectivo +
    cajaBalance.totalYape +
    cajaBalance.totalPlin +
    cajaBalance.totalTransferencia +
    cajaBalance.totalTarjeta +
    cajaBalance.totalMixto;

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
          <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl text-[11px] space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span>Monto de Apertura:</span>
              <span className="text-white font-mono">{cajaBalance.montoApertura.toFixed(2)} S/</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Ventas Recaudadas:</span>
              <span className="text-white font-mono">+{totalVentas.toFixed(2)} S/</span>
            </div>
            <div className="flex justify-between text-slate-300 border-t border-white/5 pt-1.5 mt-1.5">
              <span className="font-bold text-white">Total Esperado en Caja:</span>
              <span className="text-emerald-400 font-mono font-black">{cajaBalance.totalTeorico.toFixed(2)} S/</span>
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
              className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Comentario / Diferencias</label>
            <input
              type="text"
              value={comentarioCaja}
              onChange={(e) => setComentarioCaja(e.target.value)}
              placeholder="Ej. Todo cuadrado..."
              className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
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
    cajaBalance.totalEfectivo +
    cajaBalance.totalYape +
    cajaBalance.totalPlin +
    cajaBalance.totalTransferencia +
    cajaBalance.totalTarjeta +
    cajaBalance.totalMixto;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm glass-panel border border-white/10 rounded-3xl p-6 relative shadow-2xl bg-[#141226]/95 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="text-sm font-black text-white uppercase tracking-tight">Arqueo Desglosado por Forma de Pago</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>

        <div className="space-y-2 text-xs divide-y divide-white/5">
          <div className="flex justify-between py-2 text-slate-300">
            <span>Efectivo (Matrículas / Ventas):</span>
            <span className="text-white font-mono font-bold">{cajaBalance.totalEfectivo.toFixed(2)} S/</span>
          </div>
          <div className="flex justify-between py-2 text-slate-300">
            <span>Yape:</span>
            <span className="text-white font-mono font-bold">{cajaBalance.totalYape.toFixed(2)} S/</span>
          </div>
          <div className="flex justify-between py-2 text-slate-300">
            <span>Plin:</span>
            <span className="text-white font-mono font-bold">{cajaBalance.totalPlin.toFixed(2)} S/</span>
          </div>
          <div className="flex justify-between py-2 text-slate-300">
            <span>Transferencia Bancaria:</span>
            <span className="text-white font-mono font-bold">{cajaBalance.totalTransferencia.toFixed(2)} S/</span>
          </div>
          <div className="flex justify-between py-2 text-slate-300">
            <span>Tarjeta (Débito / Crédito):</span>
            <span className="text-white font-mono font-bold">{cajaBalance.totalTarjeta.toFixed(2)} S/</span>
          </div>
          <div className="flex justify-between py-2 text-slate-300">
            <span>Cobro Mixto:</span>
            <span className="text-white font-mono font-bold">{cajaBalance.totalMixto.toFixed(2)} S/</span>
          </div>
          <div className="flex justify-between py-3 border-t border-white/10 text-emerald-400 font-bold text-sm">
            <span>Total Ventas Recaudado:</span>
            <span className="font-mono">{totalVentas.toFixed(2)} S/</span>
          </div>
          <div className="flex justify-between py-2 text-slate-400 font-mono text-[10px]">
            <span>Fondo de Caja Inicial:</span>
            <span>+{cajaBalance.montoApertura.toFixed(2)} S/</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-slate-300 hover:text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
        >
          Cerrar Vista
        </button>
      </div>
    </div>
  );
};
