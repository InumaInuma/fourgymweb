import React, { useState, useEffect } from 'react';
import { apiService } from '../../../../data/apiService';

interface VentaExpressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ventaPayload: any) => Promise<void>;
  socios: any[];
  cajaSesionId: number;
}

export const VentaExpressModal: React.FC<VentaExpressModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  socios,
  cajaSesionId,
}) => {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedSocioId, setSelectedSocioId] = useState<string>('libre');
  const [quantity, setQuantity] = useState<number>(1);
  const [paymentMethodId, setPaymentMethodId] = useState<number>(1); // 1 = Efectivo
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      setLoading(true);
      apiService.getProductos()
        .then(data => {
          setProducts(data);
          if (data.length > 0) {
            setSelectedProductId(data[0].id.toString());
          }
        })
        .catch(err => {
          setError(err.message || 'Error al cargar catálogo de productos.');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const selectedProduct = products.find(p => p.id.toString() === selectedProductId);
  const total = selectedProduct ? selectedProduct.precioVenta * quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      setError('Por favor seleccione un producto.');
      return;
    }
    if (quantity <= 0) {
      setError('La cantidad debe ser mayor a cero.');
      return;
    }
    
    // Check stock limit for physical products (excluding Clase Libre which has stock 9999)
    if (selectedProduct.nombre !== 'Clase Libre Individual' && selectedProduct.stockActual < quantity) {
      setError(`Stock insuficiente. Solo quedan ${selectedProduct.stockActual} unidades.`);
      return;
    }

    try {
      setError('');
      const payload = {
        idSocio: selectedSocioId === 'libre' ? null : parseInt(selectedSocioId, 10),
        idSesionCaja: cajaSesionId,
        total: total,
        idFormaPago: paymentMethodId,
        detalles: [
          {
            idProducto: selectedProduct.id,
            cantidad: quantity,
            precioUnitario: selectedProduct.precioVenta,
            subtotal: total
          }
        ]
      };
      await onSubmit(payload);
    } catch (err: any) {
      setError(err.message || 'Error al registrar la venta.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm glass-panel border border-white/10 rounded-3xl p-6 relative shadow-2xl bg-[#141226]/95">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
          <h3 className="text-sm font-black text-white uppercase tracking-tight flex items-center gap-1.5">
            🥤 Registrar Venta (Bar Fit / POS)
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>

        {error && (
          <div className="mb-3 text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Socio Selection */}
          <div>
            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Cliente / Socio</label>
            <select
              value={selectedSocioId}
              onChange={(e) => setSelectedSocioId(e.target.value)}
              className="w-full bg-[#1a1c36] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green"
              style={{ background: '#1a1c36', color: '#fff' }}
            >
              <option value="libre">👥 Público General (Venta Libre)</option>
              {socios.map(s => (
                <option key={s.idSocio} value={s.idSocio}>
                  👤 {s.nombre} {s.apellidoPaterno} ({s.numeroDocumento})
                </option>
              ))}
            </select>
          </div>

          {/* Product Selection */}
          <div>
            <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Producto / Servicio</label>
            {loading ? (
              <div className="text-xs text-slate-400 font-semibold py-2">Cargando catálogo...</div>
            ) : (
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-[#1a1c36] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green"
                style={{ background: '#1a1c36', color: '#fff' }}
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} - S/ {p.precioVenta.toFixed(2)} {p.stockActual < 9999 ? `(Stock: ${p.stockActual})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Quantity */}
            <div>
              <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Cantidad</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full bg-[#1a1c36] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green font-mono"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Forma de Pago</label>
              <select
                value={paymentMethodId}
                onChange={(e) => setPaymentMethodId(parseInt(e.target.value, 10))}
                className="w-full bg-[#1a1c36] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green"
                style={{ background: '#1a1c36', color: '#fff' }}
              >
                <option value="1">💵 Efectivo</option>
                <option value="2">📱 Yape</option>
                <option value="3">📱 Plin</option>
                <option value="4">🏦 Transferencia</option>
                <option value="5">💳 Tarjeta</option>
              </select>
            </div>
          </div>

          {/* Total Display */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monto Total</span>
            <span className="text-lg font-black text-brand-green font-mono">
              S/ {total.toFixed(2)}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading || !selectedProduct}
            className="w-full py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-strong text-slate-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Completar Venta
          </button>
        </form>
      </div>
    </div>
  );
};
