import React from 'react';
import type { GymClass } from '../../../domain/entities';

interface ActiveClassesTableProps {
  classes: GymClass[];
  onEditClick: (c: GymClass) => void;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  filterStartDate: string;
  setFilterStartDate: (date: string) => void;
  filterEndDate: string;
  setFilterEndDate: (date: string) => void;
  onApplyFilter: () => void;
  onClearFilter: () => void;
}

export const ActiveClassesTable: React.FC<ActiveClassesTableProps> = ({
  classes,
  onEditClick,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  filterStartDate,
  setFilterStartDate,
  filterEndDate,
  setFilterEndDate,
  onApplyFilter,
  onClearFilter,
}) => {
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return (
    <div className="glass-card relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/5 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-accent-cyan rounded-full"></span>
            Clases Activas y Programadas
          </h2>
          <p className="text-xs text-text-secondary mt-1">
            Visualiza y gestiona las sesiones agendadas de la semana. Haz clic en "Editar" para cambiar instructor u horarios.
          </p>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Fecha Desde</label>
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent-cyan"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Fecha Hasta</label>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent-cyan"
            />
          </div>
          <div className="flex items-center gap-2 self-end">
            <button
              onClick={onApplyFilter}
              className="px-3.5 py-1.5 bg-accent-cyan hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Filtrar
            </button>
            <button
              onClick={onClearFilter}
              className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs text-slate-300">
          <thead>
            <tr className="border-b border-white/5 text-text-secondary uppercase tracking-widest text-[10px] font-bold">
              <th className="py-3 px-4">Clase / Título</th>
              <th className="py-3 px-4">Profesor / Instructor</th>
              <th className="py-3 px-4">Salón</th>
              <th className="py-3 px-4">Horario</th>
              <th className="py-3 px-4">Precio (S/)</th>
              <th className="py-3 px-4">Reservas</th>
              <th className="py-3 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-semibold">
            {classes.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No hay clases programadas disponibles.
                </td>
              </tr>
            ) : (
              classes.map((c) => {
                const formattedDate = c.fechaInicio
                  ? new Date(c.fechaInicio).toLocaleDateString('es-PE', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                    })
                  : 'Hoy';
                return (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 text-white font-bold">{c.title}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                        {c.instructor}
                      </div>
                    </td>
                    <td className="py-4 px-4">{c.roomName || 'Salón Principal'}</td>
                    <td className="py-4 px-4 text-slate-200">
                      <span className="block font-bold">{formattedDate}</span>
                      <span className="text-[10px] text-text-secondary">{c.time}</span>
                    </td>
                    <td className="py-4 px-4 font-mono">S/ {c.price.toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-[10px]">
                        {c.spotsReserved} / {c.spotsTotal}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => onEditClick(c)}
                        className="px-3 py-1.5 bg-accent-cyan/15 hover:bg-accent-cyan text-accent-cyan hover:text-slate-950 font-bold rounded-lg transition-all text-[11px] uppercase tracking-wider cursor-pointer"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-4 mt-6 text-slate-400 text-xs">
        <div>
          Mostrando <span className="text-white font-bold">{totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> a{' '}
          <span className="text-white font-bold">{Math.min(currentPage * pageSize, totalItems)}</span> de{' '}
          <span className="text-white font-bold">{totalItems}</span> clases
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none border border-white/10 text-white font-bold rounded-xl transition-all cursor-pointer text-xs"
          >
            Anterior
          </button>
          <span className="text-text-secondary">
            Página <span className="text-white font-bold">{currentPage}</span> de <span className="text-white font-bold">{totalPages}</span>
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none border border-white/10 text-white font-bold rounded-xl transition-all cursor-pointer text-xs"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};
