import React from 'react';
import type { GymClass, Instructor } from '../../../domain/entities';

interface ClassEditModalProps {
  setEditingClass: (c: GymClass | null) => void;
  editTitle: string;
  setEditTitle: (t: string) => void;
  editInstructorId: string;
  setEditInstructorId: (id: string) => void;
  editRoomName: string;
  setEditRoomName: (r: string) => void;
  editDate: string;
  setEditDate: (d: string) => void;
  editStartTime: string;
  setEditStartTime: (t: string) => void;
  editEndTime: string;
  setEditEndTime: (t: string) => void;
  editPrice: string;
  setEditPrice: (p: string) => void;
  instructors: Instructor[];
  onSubmit: (e: React.FormEvent) => void;
}

const standardHours = [
  '06:00 a.m.', '07:00 a.m.', '08:00 a.m.', '09:00 a.m.', '10:00 a.m.', '11:00 a.m.', '12:00 p.m.',
  '01:00 p.m.', '02:00 p.m.', '03:00 p.m.', '04:00 p.m.', '05:00 p.m.', '06:00 p.m.', '07:00 p.m.',
  '08:00 p.m.', '09:00 p.m.', '10:00 p.m.', '11:00 p.m.', '12:00 a.m.'
];

export const ClassEditModal: React.FC<ClassEditModalProps> = ({
  setEditingClass,
  editTitle,
  setEditTitle,
  editInstructorId,
  setEditInstructorId,
  editRoomName,
  setEditRoomName,
  editDate,
  setEditDate,
  editStartTime,
  setEditStartTime,
  editEndTime,
  setEditEndTime,
  editPrice,
  setEditPrice,
  instructors,
  onSubmit,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md transition-all duration-300">
      <div className="glass-card w-full max-w-lg bg-[#181630] border border-white/10 p-6 space-y-6 shadow-2xl rounded-2xl relative">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-accent-cyan rounded-full"></span>
            <h3 className="text-lg font-bold text-white uppercase tracking-tight">Editar Clase Programada</h3>
          </div>
          <button
            onClick={() => setEditingClass(null)}
            className="text-text-secondary hover:text-white transition-colors p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Clase de Baile
              </label>
              <select
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-[#1c2230] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-cyan"
              >
                <option value="Salsa & Bachata">Salsa & Bachata</option>
                <option value="Zumba Fitness">Zumba Fitness</option>
                <option value="Baile Urbano">Baile Urbano</option>
                <option value="Ritmos Latinos">Ritmos Latinos</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Profesor / Instructor
              </label>
              <select
                value={editInstructorId}
                onChange={(e) => setEditInstructorId(e.target.value)}
                className="w-full bg-[#1c2230] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-cyan"
              >
                {instructors.map((instructor) => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.name} ({instructor.specialty})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Salón de Baile
              </label>
              <select
                value={editRoomName}
                onChange={(e) => setEditRoomName(e.target.value)}
                className="w-full bg-[#1c2230] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-cyan"
              >
                <option value="Salón Principal">Salón Principal</option>
                <option value="Salón A">Salón A</option>
                <option value="Salón B">Salón B</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Fecha
                </label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full bg-[#1c2230] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-cyan text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Hora Inicio
                </label>
                <select
                  value={editStartTime}
                  onChange={(e) => setEditStartTime(e.target.value)}
                  className="w-full bg-[#1c2230] border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-accent-cyan font-mono text-xs"
                >
                  {standardHours.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Hora Fin
                </label>
                <select
                  value={editEndTime}
                  onChange={(e) => setEditEndTime(e.target.value)}
                  className="w-full bg-[#1c2230] border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-accent-cyan font-mono text-xs"
                >
                  {standardHours.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                Precio de Entrada (S/)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                className="w-full bg-[#1c2230] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-cyan"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => setEditingClass(null)}
              className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl uppercase tracking-wider text-xs border border-white/5 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-accent-cyan hover:bg-cyan-400 text-slate-950 font-black rounded-xl uppercase tracking-wider text-xs shadow-lg shadow-accent-cyan/15 transition-all"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
