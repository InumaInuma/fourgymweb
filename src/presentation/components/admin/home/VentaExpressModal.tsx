import React, { useState } from 'react';

interface VentaExpressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (producto: string, monto: string, metodoPago: string) => void;
}

export const VentaExpressModal: React.FC<VentaExpressModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [ventaProducto, setVentaProducto] = useState('Gatorade');
  const [ventaMonto, setVentaMonto] = useState('4.00');
  const [ventaMetodoPago, setVentaMetodoPago] = useState('Yape');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(ventaProducto, ventaMonto, ventaMetodoPago);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm glass-panel border border-white/10 rounded-3xl p-6 relative shadow-2xl bg-[#141226]/95">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
          <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5">
            🥤 Registrar Venta Express (Bar Fit)
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Producto</label>
            <select
              value={ventaProducto}
              onChange={(e) => {
                setVentaProducto(e.target.value);
                if (e.target.value === 'Gatorade') setVentaMonto('4.00');
                else if (e.target.value === 'Agua San Luis') setVentaMonto('2.50');
                else if (e.target.value === 'Batido Proteína') setVentaMonto('8.00');
                else setVentaMonto('5.00');
              }}
              className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green"
              style={{ background: '#1a1c36', color: '#fff' }}
            >
              <option value="Gatorade">Gatorade (S/ 4.00)</option>
              <option value="Agua San Luis">Agua San Luis (S/ 2.50)</option>
              <option value="Batido Proteína">Batido Proteína (S/ 8.00)</option>
              <option value="Barra Energética">Barra Energética (S/ 5.00)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Precio Cobrado (S/)</label>
            <input
              type="number"
              step="0.10"
              required
              value={ventaMonto}
              onChange={(e) => setVentaMonto(e.target.value)}
              className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green font-mono"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Método de Pago</label>
            <select
              value={ventaMetodoPago}
              onChange={(e) => setVentaMetodoPago(e.target.value)}
              className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green"
              style={{ background: '#1a1c36', color: '#fff' }}
            >
              <option value="Yape">Yape</option>
              <option value="Plin">Plin</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-strong text-slate-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            Completar Venta
          </button>
        </form>
      </div>
    </div>
  );
};
