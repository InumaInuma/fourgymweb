import React, { useState, useEffect } from 'react';
import { apiService } from '../../../../data/apiService';
import type { Colaborador, Sucursal } from '../../../../data/apiService';
import { CollaboratorModal } from './CollaboratorModal';
import { Toast } from '../../ui/Toast';

export const CollaboratorsPanel: React.FC = () => {
  const [collaborators, setCollaborators] = useState<Colaborador[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>(''); // For modal form validation errors
  const [toast, setToast] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingColaborador, setEditingColaborador] = useState<Colaborador | null>(null);
  const [formLoading, setFormLoading] = useState<boolean>(false);

  const loadCollaborators = async () => {
    setLoading(true);
    try {
      const data = await apiService.getColaboradores();
      setCollaborators(data);
    } catch (err: any) {
      setToast({ tipo: 'error', texto: err.message || 'Error al cargar los colaboradores.' });
    } finally {
      setLoading(false);
    }
  };

  const loadSucursales = async () => {
    try {
      const data = await apiService.getSucursales();
      setSucursales(data);
    } catch (err: any) {
      console.error('Error al obtener sucursales:', err);
    }
  };

  useEffect(() => {
    loadCollaborators();
    loadSucursales();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingColaborador(null);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (colab: Colaborador) => {
    setEditingColaborador(colab);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSaveCollaborator = async (payload: any) => {
    setErrorMsg('');
    setFormLoading(true);

    try {
      if (editingColaborador) {
        // Edit Flow
        await apiService.actualizarColaborador(editingColaborador.idUsuario, payload);
        setToast({ tipo: 'success', texto: 'Colaborador actualizado con éxito.' });
      } else {
        // Create Flow
        await apiService.registrarColaborador(payload);
        setToast({ tipo: 'success', texto: 'Colaborador registrado con éxito. Cuenta lista para configurar contraseña.' });
      }

      await loadCollaborators();
      
      // Breve retraso para que el usuario aprecie el éxito
      setTimeout(() => {
        setIsModalOpen(false);
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar el colaborador.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Está seguro de que desea eliminar lógicamente este colaborador?')) return;
    try {
      await apiService.eliminarColaborador(id);
      setToast({ tipo: 'success', texto: 'Colaborador eliminado con éxito.' });
      await loadCollaborators();
    } catch (err: any) {
      setToast({ tipo: 'error', texto: err.message || 'Error al eliminar el colaborador.' });
    }
  };

  // Filter
  const filteredColabs = collaborators.filter(c => {
    const fullText = `${c.nombre} ${c.apellidoPaterno} ${c.apellidoMaterno} ${c.numeroDocumento} ${c.nombreRol}`.toLowerCase();
    return fullText.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-white/5 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-accent-cyan rounded-full"></span>
            Gestión del Personal y Colaboradores
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Administra los roles de acceso a tus sedes (Recepcionistas, Instructores y Entrenadores). Asigna su sede de trabajo para control de acceso automático.
          </p>
        </div>
        <div>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-accent-cyan hover:bg-cyan-400 text-slate-950 font-bold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-accent-cyan/10 cursor-pointer flex items-center gap-2"
          >
            <svg className="w-4 h-4 stroke-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Agregar Colaborador
          </button>
        </div>
      </div>

      {/* Toast Notification for dynamic premium feedback */}
      <Toast mensaje={toast} onClose={() => setToast(null)} />

      {/* Filter and Table Card */}
      <div className="glass-card relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 mb-6">
          <div className="w-full sm:max-w-xs">
            <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider block mb-1">Buscar Personal</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nombre, DNI o Rol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-accent-cyan transition-all"
              />
              <svg className="w-4 h-4 text-text-secondary absolute left-3 top-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-text-secondary">Cargando lista de colaboradores...</p>
          </div>
        ) : filteredColabs.length === 0 ? (
          <div className="text-center py-12 bg-white/[0.01] rounded-2xl border border-white/5">
            <svg className="w-12 h-12 text-white/10 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.109A11.386 11.386 0 0110.052 20M14.214 16.055a9.388 9.388 0 00-4.162.945M14.214 16.055c.085-.333.129-.682.129-1.04 0-2.072-1.398-3.818-3.32-4.341M10.052 20a11.382 11.382 0 01-5.011-1.228 4.128 4.128 0 017.532-2.492M10.052 20V19.9" />
            </svg>
            <p className="text-sm font-semibold text-white/50">No se encontraron colaboradores</p>
            <p className="text-xs text-text-secondary mt-1">Intenta con otro término de búsqueda o crea uno nuevo.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-text-secondary uppercase font-bold tracking-wider">
                  <th className="pb-3 pl-4">Colaborador</th>
                  <th className="pb-3">DNI</th>
                  <th className="pb-3">Rol</th>
                  <th className="pb-3">Sede Asignada</th>
                  <th className="pb-3">Contacto</th>
                  <th className="pb-3 text-center">Estado</th>
                  <th className="pb-3 pr-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {filteredColabs.map((c) => (
                  <tr key={c.idUsuario} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 pl-4 font-bold text-white">
                      {c.nombre} {c.apellidoPaterno} {c.apellidoMaterno}
                    </td>
                    <td className="py-4 text-slate-300 font-mono">{c.numeroDocumento}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        c.idRol === 1 ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                        c.idRol === 6 ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' :
                        'bg-slate-500/10 text-slate-300 border border-slate-500/20'
                      }`}>
                        {c.nombreRol}
                      </span>
                    </td>
                    <td className="py-4 text-slate-300">
                      {c.idSucursal ? (
                        <span className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse"></span>
                          {c.nombreSucursal}
                        </span>
                      ) : (
                        <span className="text-text-secondary font-semibold italic">Acceso Global</span>
                      )}
                    </td>
                    <td className="py-4 flex flex-col">
                      <span className="text-white">{c.correo || '-'}</span>
                      <span className="text-[10px] text-text-secondary">{c.telefono || '-'}</span>
                    </td>
                    <td className="py-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.activo ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {c.activo ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(c)}
                          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(c.idUsuario)}
                          className="p-2 bg-rose-500/5 hover:bg-rose-500/15 rounded-xl text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Collaborator Modal */}
      <CollaboratorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        collaborator={editingColaborador}
        onSave={handleSaveCollaborator}
        formLoading={formLoading}
        errorMsg={errorMsg}
        sucursales={sucursales}
      />
    </div>
  );
};
