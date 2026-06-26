import React from 'react';
import type { GymClass } from '../../../domain/entities';

interface AttendanceClassSelectorProps {
  attendanceDate: string;
  attendanceClasses: GymClass[];
  selectedClass: GymClass | null;
  onAttendanceDateChange: (date: string) => void;
  onSelectClass: (c: GymClass) => void;
}

export const AttendanceClassSelector: React.FC<AttendanceClassSelectorProps> = ({
  attendanceDate,
  attendanceClasses,
  selectedClass,
  onAttendanceDateChange,
  onSelectClass,
}) => {
  return (
    <div className="glass-card flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h2 className="text-lg font-bold text-white">Validar Asistencias por Clase</h2>
        <p className="text-xs text-text-secondary mt-0.5">
          Filtra por fecha y selecciona la sesión para auditar la asistencia en el mapa de asientos
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {/* Date picker */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Filtrar por Fecha</span>
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => onAttendanceDateChange(e.target.value)}
            className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-green cursor-pointer"
          />
        </div>

        {/* Class dropdown */}
        <div className="flex flex-col gap-1 min-w-[200px]">
          <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Seleccionar Clase</span>
          <select
            value={selectedClass?.id || ''}
            onChange={(e) => {
              const found = attendanceClasses.find((c) => c.id === e.target.value);
              if (found) onSelectClass(found);
            }}
            className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-green cursor-pointer"
          >
            {attendanceClasses.length === 0 ? (
              <option value="">No hay clases para esta fecha</option>
            ) : (
              <>
                <option value="" disabled>Selecciona una clase</option>
                {attendanceClasses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.time})
                  </option>
                ))}
              </>
            )}
          </select>
        </div>
      </div>
    </div>
  );
};
