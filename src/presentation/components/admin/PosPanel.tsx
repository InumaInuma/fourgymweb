import React, { useState, useEffect } from 'react';
import { apiService } from '../../../data/apiService';
import type { User } from '../../../domain/entities';
import { CashSessionTable, type TransaccionCaja } from './home/CashSessionTable';

interface PosPanelProps {
  user: User;
}

export const PosPanel: React.FC<PosPanelProps> = ({ user: _user }) => {
  const [activeSubTab, setActiveSubTab] = useState<'checkout' | 'history'>('checkout');
  
  // Caja states
  const [cajaSesion, setCajaSesion] = useState<any | null>(null);
  const [cajaLoading, setCajaLoading] = useState(true);

  // Products catalog list
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  
  // Search & Cart states
  const [productQuery, setProductQuery] = useState('');
  const [cart, setCart] = useState<{ product: any; quantity: number }[]>([]);
  const [paymentMethodId, setPaymentMethodId] = useState<number>(1); // 1 = Efectivo
  const [selectedSocioId, setSelectedSocioId] = useState<string>('libre');
  const [socios, setSocios] = useState<any[]>([]);
  const [socioQuery, setSocioQuery] = useState('');

  // Sales History States
  const [sales, setSales] = useState<TransaccionCaja[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);
  const [salesError, setSalesError] = useState('');
  
  // Date Filters
  const getTodayStr = () => new Date().toLocaleDateString('sv-SE');
  const [startDate, setStartDate] = useState(getTodayStr());
  const [endDate, setEndDate] = useState(getTodayStr());

  // Pagination states
  const [catalogPage, setCatalogPage] = useState(1);
  const itemsPerPage = 8;

  // Checkout submission states
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutSuccess, setCheckoutSuccess] = useState('');

  const loadInitialData = async () => {
    try {
      setCajaLoading(true);
      // 1. Get Active Box Session
      const activeCaja = await apiService.getCajaSesionActiva();
      setCajaSesion(activeCaja);

      // 2. Get Products Catalog
      setLoadingProducts(true);
      const prodList = await apiService.getProductos();
      setProducts(prodList);

      // 3. Get Members List for autocomplete lookup
      const sociosList = await apiService.getSociosConMembresias();
      setSocios(sociosList);
    } catch (err) {
      console.error('Error loading POS initial data:', err);
    } finally {
      setCajaLoading(false);
      setLoadingProducts(false);
    }
  };

  const fetchSalesHistory = async () => {
    try {
      setLoadingSales(true);
      const data = await apiService.getVentasHistorial(startDate, endDate);
      setSales(data);
    } catch (err: any) {
      setSalesError(err.message || 'Error al obtener historial de ventas.');
    } finally {
      setLoadingSales(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'history') {
      fetchSalesHistory();
    }
  }, [activeSubTab]);

  // Product Auto-complete filtering
  const filteredProducts = products.filter(p => 
    p.nombre.toLowerCase().includes(productQuery.toLowerCase()) ||
    (p.descripcion && p.descripcion.toLowerCase().includes(productQuery.toLowerCase()))
  );

  // Socio Auto-complete filtering
  const filteredSocios = socios.filter(s =>
    `${s.nombre} ${s.apellidoPaterno} ${s.apellidoMaterno}`.toLowerCase().includes(socioQuery.toLowerCase()) ||
    s.numeroDocumento.includes(socioQuery)
  );

  // Cart operations
  const addToCart = (product: any) => {
    setCheckoutSuccess('');
    setCheckoutError('');
    // Check if product is already in cart
    const existing = cart.find(item => item.product.id === product.id);
    const currentQty = existing ? existing.quantity : 0;
    
    // Check stock limit for physical products
    if (product.nombre !== 'Clase Libre Individual' && product.stockActual <= currentQty) {
      alert(`No hay suficiente stock. Solo quedan ${product.stockActual} unidades.`);
      return;
    }

    if (existing) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateCartQty = (productId: number, qty: number) => {
    const item = cart.find(item => item.product.id === productId);
    if (!item) return;

    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (item.product.nombre !== 'Clase Libre Individual' && item.product.stockActual < qty) {
      alert(`No hay suficiente stock. Solo quedan ${item.product.stockActual} unidades.`);
      return;
    }

    setCart(cart.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: qty } 
        : item
    ));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.precioVenta * item.quantity), 0);

  const handleCheckout = async () => {
    if (!cajaSesion) {
      setCheckoutError('Debes tener una sesión de caja activa para vender.');
      return;
    }
    if (cart.length === 0) {
      setCheckoutError('El carrito está vacío.');
      return;
    }

    try {
      setCheckoutLoading(true);
      setCheckoutError('');
      setCheckoutSuccess('');

      const payload = {
        idSocio: selectedSocioId === 'libre' ? null : parseInt(selectedSocioId, 10),
        idSesionCaja: cajaSesion.id,
        total: cartTotal,
        idFormaPago: paymentMethodId,
        detalles: cart.map(item => ({
          idProducto: item.product.id,
          cantidad: item.quantity,
          precioUnitario: item.product.precioVenta,
          subtotal: item.product.precioVenta * item.quantity
        }))
      };

      await apiService.registrarVenta(payload);
      setCheckoutSuccess('🛍️ Venta registrada y stock actualizado con éxito.');
      setCart([]);
      setSelectedSocioId('libre');
      setSocioQuery('');
      setProductQuery('');
      
      // Reload products to get updated stock
      const updatedProds = await apiService.getProductos();
      setProducts(updatedProds);
    } catch (err: any) {
      setCheckoutError(err.message || 'Error al completar la venta.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Pagination lists math
  const catalogStartIndex = (catalogPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(catalogStartIndex, catalogStartIndex + itemsPerPage);
  const catalogTotalPages = Math.ceil(filteredProducts.length / itemsPerPage);


  if (cajaLoading) {
    return <div className="text-center py-12 text-slate-400 text-xs font-bold">Verificando sesión de caja...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-1.5 h-6 bg-[#00b894] rounded-full"></span>
          Módulo de Ventas & Caja Chica (POS)
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Registra compras del Bar Fit, adquiere toallas y cobra el pase de Clase Libre al instante.
        </p>
      </div>

      {/* Warning Box if Caja is Closed */}
      {!cajaSesion && (
        <div className="p-5 bg-rose-500/15 border border-rose-500/30 rounded-3xl flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-xs font-black text-rose-400 uppercase tracking-widest">⚠️ Caja Cerrada o Fuera de Turno</h4>
            <p className="text-[11px] text-slate-300">
              Debes abrir la caja chica en la pestaña de <strong>Inicio</strong> antes de poder procesar cobros y registrar ventas de productos.
            </p>
          </div>
        </div>
      )}

      {/* Sub-Tabs */}
      <div className="flex border-b border-white/5 pb-0.5 space-x-6 font-bold">
        <button
          onClick={() => setActiveSubTab('checkout')}
          className={`pb-2.5 text-xs uppercase tracking-wider transition-all cursor-pointer relative ${
            activeSubTab === 'checkout'
              ? 'text-white border-b-2 border-brand-green font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          🛒 Registrar Venta (Checkout)
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`pb-2.5 text-xs uppercase tracking-wider transition-all cursor-pointer relative ${
            activeSubTab === 'history'
              ? 'text-white border-b-2 border-brand-green font-black'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          📋 Historial Auditado
        </button>
      </div>

      {/* TAB CONTENT: CHECKOUT */}
      {activeSubTab === 'checkout' && cajaSesion && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Center: Product Search & Selector */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search inputs */}
            <div className="glass-panel border border-white/5 rounded-2xl p-4">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">🔍 Buscar Producto o Servicio</label>
              <input
                type="text"
                placeholder="Escribe el nombre o categoría (ej. Gatorade, Agua, Clase Libre)..."
                value={productQuery}
                onChange={(e) => {
                  setProductQuery(e.target.value);
                  setCatalogPage(1); // Reset page on query
                }}
                className="w-full bg-[#1a1c36] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green"
              />
            </div>

            {/* Products grid */}
            {loadingProducts ? (
              <div className="text-center py-12 text-slate-400 text-xs font-bold">Cargando catálogo...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">No se encontraron productos coincidentes.</div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginatedProducts.map(prod => {
                    const isOutOfStock = prod.nombre !== 'Clase Libre Individual' && prod.stockActual <= 0;
                    return (
                      <div 
                        key={prod.id} 
                        onClick={() => !isOutOfStock && addToCart(prod)}
                        className={`glass-panel border rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 ${
                          isOutOfStock 
                            ? 'border-white/5 opacity-40 cursor-not-allowed bg-slate-950/10' 
                            : 'border-white/10 hover:border-brand-green/30 hover:shadow-lg hover:shadow-brand-green/5 cursor-pointer bg-[#1a1c36]/40'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-2">
                            <h4 className="text-xs font-black text-white uppercase tracking-tight leading-tight">{prod.nombre}</h4>
                            <span className="text-xs font-black text-brand-green font-mono whitespace-nowrap">
                              S/ {prod.precioVenta.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-[10px] text-text-secondary line-clamp-2">{prod.descripcion || 'Sin descripción'}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                            prod.nombre === 'Clase Libre Individual'
                              ? 'bg-slate-800 text-slate-300'
                              : isOutOfStock
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {prod.nombre === 'Clase Libre Individual'
                              ? 'Servicio'
                              : isOutOfStock
                                ? 'Agotado'
                                : `Stock: ${prod.stockActual} u.`
                            }
                          </span>
                          {!isOutOfStock && (
                            <span className="text-[10px] font-black text-brand-green flex items-center gap-1">
                              Añadir +
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Catalog Pagination controls */}
                {catalogTotalPages > 1 && (
                  <div className="flex items-center justify-between bg-white/5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 border border-white/5">
                    <button
                      onClick={() => setCatalogPage(p => Math.max(1, p - 1))}
                      disabled={catalogPage === 1}
                      className="px-3 py-1 rounded bg-[#1a1c36] hover:bg-slate-900 border border-white/10 disabled:opacity-40"
                    >
                      Anterior
                    </button>
                    <span>Página {catalogPage} de {catalogTotalPages}</span>
                    <button
                      onClick={() => setCatalogPage(p => Math.min(catalogTotalPages, p + 1))}
                      disabled={catalogPage === catalogTotalPages}
                      className="px-3 py-1 bg-[#1a1c36] hover:bg-slate-900 border border-white/10 disabled:opacity-40"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Cart & Checkout forms */}
          <div className="space-y-4">
            {/* Feedback notifications */}
            {checkoutError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-2xl">
                {checkoutError}
              </div>
            )}
            {checkoutSuccess && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-2xl">
                {checkoutSuccess}
              </div>
            )}

            {/* Shopping Cart box */}
            <div className="glass-panel border border-white/10 rounded-2xl p-5 space-y-4 bg-[#141226]/80 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                <h3 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-1.5">
                  🛒 Canasta de Compra ({cart.length})
                </h3>
                {cart.length > 0 && (
                  <button 
                    onClick={() => setCart([])}
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-bold uppercase cursor-pointer"
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {/* Items listing */}
              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-[11px] font-semibold">
                  La canasta está vacía. Añade productos de la lista.
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[220px] overflow-y-auto scrollbar-thin pr-1 divide-y divide-white/5">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex justify-between items-start pt-3 first:pt-0 gap-3 text-xs">
                      <div className="flex-grow space-y-1">
                        <span className="font-bold text-white uppercase block leading-tight">{item.product.nombre}</span>
                        <span className="text-[10px] text-slate-400 font-mono">S/ {item.product.precioVenta.toFixed(2)}</span>
                      </div>
                      
                      {/* Quantity adjuster */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                          className="w-5 h-5 rounded bg-white/5 text-white flex items-center justify-center font-bold hover:bg-white/10"
                        >
                          -
                        </button>
                        <span className="w-6 text-center font-mono font-bold text-white text-[11px]">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                          className="w-5 h-5 rounded bg-white/5 text-white flex items-center justify-center font-bold hover:bg-white/10"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="w-5 h-5 ml-1 rounded bg-rose-500/10 text-rose-400 flex items-center justify-center hover:bg-rose-500/20"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Cart Summary */}
              {cart.length > 0 && (
                <div className="border-t border-white/5 pt-3.5 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Subtotal Caja</span>
                  <span className="text-xl font-black text-brand-green font-mono">S/ {cartTotal.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Customer & Payment Form */}
            <div className="glass-panel border border-white/10 rounded-2xl p-5 space-y-4 bg-[#141226]/85">
              <h3 className="text-xs font-black uppercase text-white tracking-wider border-b border-white/5 pb-2">
                👤 Datos de Operación
              </h3>

              {/* Autocomplete Socio Select */}
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Cliente / Socio</label>
                <input
                  type="text"
                  placeholder="Buscar socio por DNI o nombre..."
                  value={socioQuery}
                  onChange={(e) => setSocioQuery(e.target.value)}
                  className="w-full bg-[#1a1c36] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none mb-2"
                />

                <select
                  value={selectedSocioId}
                  onChange={(e) => setSelectedSocioId(e.target.value)}
                  className="w-full bg-[#1a1c36] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green"
                  style={{ background: '#1a1c36', color: '#fff' }}
                >
                  <option value="libre">👥 Público General (Venta de Mostrador)</option>
                  {filteredSocios.slice(0, 15).map(s => (
                    <option key={s.idSocio} value={s.idSocio}>
                      👤 {s.nombre} {s.apellidoPaterno} ({s.numeroDocumento})
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Forma de Pago</label>
                <select
                  value={paymentMethodId}
                  onChange={(e) => setPaymentMethodId(parseInt(e.target.value, 10))}
                  className="w-full bg-[#1a1c36] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green"
                  style={{ background: '#1a1c36', color: '#fff' }}
                >
                  <option value="1">💵 Efectivo</option>
                  <option value="2">📱 Yape</option>
                  <option value="3">📱 Plin</option>
                  <option value="4">🏦 Transferencia Bancaria</option>
                  <option value="5">💳 Tarjeta (POS)</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={checkoutLoading || cart.length === 0}
                className="w-full py-3 rounded-xl bg-brand-green hover:bg-brand-green-strong text-slate-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-brand-green/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {checkoutLoading ? 'Confirmando...' : 'Completar y Generar Venta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: AUDITED HISTORY */}
      {activeSubTab === 'history' && (
        <div className="space-y-4">
          {/* Filters card */}
          <div className="glass-panel border border-white/5 rounded-2xl p-4 flex flex-col md:flex-row md:items-end gap-4 bg-[#141226]/50">
            <div className="grid grid-cols-2 gap-3 flex-grow max-w-md">
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Fecha Inicio</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-[#1a1c36] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-brand-green font-mono"
                />
              </div>
              <div>
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Fecha Fin</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-[#1a1c36] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-brand-green font-mono"
                />
              </div>
            </div>

            <button
              onClick={fetchSalesHistory}
              disabled={loadingSales}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-black uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 self-start md:self-auto"
            >
              🔍 {loadingSales ? 'Buscando...' : 'Filtrar Historial'}
            </button>
          </div>

          {/* Audit Listing table */}
          {salesError && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-2xl">
              {salesError}
            </div>
          )}

          <CashSessionTable
            transactions={sales}
            loading={loadingSales}
            emptyMessage="No hay transacciones para el rango de fechas seleccionado."
            pageSize={10}
          />
        </div>
      )}
    </div>
  );
};

