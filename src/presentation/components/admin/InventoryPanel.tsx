import React, { useState, useEffect } from 'react';
import { apiService } from '../../../data/apiService';

export const InventoryPanel: React.FC = () => {
  // Products states
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState('');
  
  // Pagination
  const [catalogPage, setCatalogPage] = useState(1);
  const itemsPerPage = 8;
  
  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [editingProd, setEditingProd] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priceVenta, setPriceVenta] = useState('5.00');
  const [costo, setCosto] = useState('2.00');
  const [stockActual, setStockActual] = useState(20);
  const [stockMinimo, setStockMinimo] = useState(5);
  const [activo, setActivo] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      setProductsError('');
      const data = await apiService.getProductos();
      setProducts(data);
    } catch (err: any) {
      setProductsError(err.message || 'Error al obtener productos.');
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenCreate = () => {
    setEditingProd(null);
    setName('');
    setDescription('');
    setPriceVenta('5.00');
    setCosto('2.00');
    setStockActual(20);
    setStockMinimo(5);
    setActivo(true);
    setFormError('');
    setIsOpen(true);
  };

  const handleOpenEdit = (prod: any) => {
    setEditingProd(prod);
    setName(prod.nombre);
    setDescription(prod.descripcion || '');
    setPriceVenta(prod.precioVenta.toString());
    setCosto(prod.costo.toString());
    setStockActual(prod.stockActual);
    setStockMinimo(prod.stockMinimo);
    setActivo(prod.activo);
    setFormError('');
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('El nombre es requerido.');
      return;
    }
    const pV = parseFloat(priceVenta);
    const cS = parseFloat(costo);
    if (isNaN(pV) || pV < 0) {
      setFormError('El precio de venta debe ser un número válido.');
      return;
    }
    if (isNaN(cS) || cS < 0) {
      setFormError('El costo debe ser un número válido.');
      return;
    }

    try {
      setFormLoading(true);
      setFormError('');
      const payload = {
        id: editingProd ? editingProd.id : 0,
        nombre: name,
        descripcion: description,
        precioVenta: pV,
        costo: cS,
        stockActual: name === 'Clase Libre Individual' ? 9999 : stockActual,
        stockMinimo: name === 'Clase Libre Individual' ? 0 : stockMinimo,
        activo: activo,
      };
      await apiService.saveProducto(payload);
      setIsOpen(false);
      loadProducts();
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar el producto.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Area */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#00b894] rounded-full"></span>
            Inventario & Stock de Productos
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Administra el catálogo de productos físicos, stock mínimo, alertas de reabastecimiento y precios.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-strong text-slate-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-brand-green/10 active:scale-95"
        >
          ➕ Registrar Nuevo Producto
        </button>
      </div>

      <div className="space-y-4">
        {productsError && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold rounded-2xl">
            {productsError}
          </div>
        )}

        {loadingProducts ? (
          <div className="text-center py-12 text-slate-400 text-xs font-bold">
            Cargando catálogo...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/20 border border-white/5 rounded-3xl p-6 text-slate-400 text-sm font-semibold">
            No hay productos registrados en el catálogo.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="glass-panel border border-white/5 rounded-3xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 uppercase tracking-widest font-black text-[10px] bg-slate-950/20">
                      <th className="py-4 px-5">Nombre</th>
                      <th className="py-4 px-5">Descripción / Categoría</th>
                      <th className="py-4 px-5 text-right">Precio Venta</th>
                      <th className="py-4 px-5 text-right">Costo</th>
                      <th className="py-4 px-5 text-center">Stock</th>
                      <th className="py-4 px-5 text-center">Estado</th>
                      <th className="py-4 px-5 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {(() => {
                      const catalogStartIndex = (catalogPage - 1) * itemsPerPage;
                      const paginatedProducts = products.slice(catalogStartIndex, catalogStartIndex + itemsPerPage);
                      return paginatedProducts.map((prod) => {
                        const isLowStock = prod.nombre !== 'Clase Libre Individual' && prod.stockActual <= prod.stockMinimo;
                        return (
                          <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-4 px-5 font-bold text-white uppercase">{prod.nombre}</td>
                            <td className="py-4 px-5 text-slate-300 max-w-[200px] truncate">{prod.descripcion || 'Sin descripción'}</td>
                            <td className="py-4 px-5 text-right font-mono font-bold text-slate-200">S/ {prod.precioVenta.toFixed(2)}</td>
                            <td className="py-4 px-5 text-right font-mono text-slate-400">S/ {prod.costo.toFixed(2)}</td>
                            <td className="py-4 px-5 text-center">
                              {prod.nombre === 'Clase Libre Individual' ? (
                                <span className="text-[10px] bg-slate-900 text-slate-300 font-bold px-2.5 py-1 rounded-lg border border-white/10">
                                  ILIMITADO (Servicio)
                                </span>
                              ) : (
                                <span className={`font-mono font-bold px-2.5 py-1 rounded-lg ${
                                  isLowStock 
                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                                    : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                                }`}>
                                  {prod.stockActual} u. {isLowStock && '⚠️'}
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-5 text-center">
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                prod.activo ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {prod.activo ? 'Activo' : 'Inactivo'}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-center">
                              <button
                                onClick={() => handleOpenEdit(prod)}
                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                              >
                                Editar
                              </button>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {(() => {
              const catalogTotalPages = Math.ceil(products.length / itemsPerPage);
              if (catalogTotalPages <= 1) return null;
              return (
                <div className="flex items-center justify-between bg-white/5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 border border-white/5">
                  <button
                    onClick={() => setCatalogPage(p => Math.max(1, p - 1))}
                    disabled={catalogPage === 1}
                    className="px-3 py-1 bg-[#1a1c36] hover:bg-slate-900 border border-white/10 disabled:opacity-40 rounded"
                  >
                    Anterior
                  </button>
                  <span>Página {catalogPage} de {catalogTotalPages}</span>
                  <button
                    onClick={() => setCatalogPage(p => Math.min(catalogTotalPages, p + 1))}
                    disabled={catalogPage === catalogTotalPages}
                    className="px-3 py-1 bg-[#1a1c36] hover:bg-slate-900 border border-white/10 disabled:opacity-40 rounded"
                  >
                    Siguiente
                  </button>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm glass-panel border border-white/10 rounded-3xl p-6 relative shadow-2xl bg-[#141226]/95">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
              <h3 className="text-sm font-black text-white uppercase tracking-tight">
                {editingProd ? '📝 Editar Producto' : '➕ Registrar Producto'}
              </h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/5 rounded text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>

            {formError && (
              <div className="mb-3 text-[11px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Gatorade 500ml..."
                  className="w-full bg-[#1a1c36] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Descripción / Categoría</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej. Bebida hidratante..."
                  className="w-full bg-[#1a1c36] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Precio Venta (S/)</label>
                  <input
                    type="number"
                    step="0.10"
                    required
                    value={priceVenta}
                    onChange={(e) => setPriceVenta(e.target.value)}
                    className="w-full bg-[#1a1c36] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Costo (S/)</label>
                  <input
                    type="number"
                    step="0.10"
                    required
                    value={costo}
                    onChange={(e) => setCosto(e.target.value)}
                    className="w-full bg-[#1a1c36] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green font-mono"
                  />
                </div>
              </div>

              {name !== 'Clase Libre Individual' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Stock Actual</label>
                    <input
                      type="number"
                      required
                      value={stockActual}
                      onChange={(e) => setStockActual(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full bg-[#1a1c36] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Stock Mínimo</label>
                    <input
                      type="number"
                      required
                      value={stockMinimo}
                      onChange={(e) => setStockMinimo(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-full bg-[#1a1c36] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-green font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="rounded bg-[#1a1c36] border-white/10 text-brand-green focus:ring-0 cursor-pointer"
                />
                <label htmlFor="activo" className="text-xs text-slate-300 select-none cursor-pointer">
                  Producto Activo (Disponible en POS)
                </label>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full py-2.5 rounded-xl bg-brand-green hover:bg-brand-green-strong text-slate-950 text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                {formLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
