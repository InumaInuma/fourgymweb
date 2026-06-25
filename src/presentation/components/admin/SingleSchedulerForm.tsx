import React from 'react';
import type { Instructor } from '../../../domain/entities';

const standardHours = [
  '06:00 a.m.', '07:00 a.m.', '08:00 a.m.', '09:00 a.m.', '10:00 a.m.', '11:00 a.m.', '12:00 p.m.',
  '01:00 p.m.', '02:00 p.m.', '03:00 p.m.', '04:00 p.m.', '05:00 p.m.', '06:00 p.m.', '07:00 p.m.',
  '08:00 p.m.', '09:00 p.m.', '10:00 p.m.', '11:00 p.m.', '12:00 a.m.'
];

interface SingleSchedulerFormProps {
  classTitle: string;
  setClassTitle: (t: string) => void;
  instructorId: string;
  setInstructorId: (id: string) => void;
  roomName: string;
  setRoomName: (r: string) => void;
  classDate: string;
  setClassDate: (d: string) => void;
  classStartTime: string;
  setClassStartTime: (t: string) => void;
  classEndTime: string;
  setClassEndTime: (t: string) => void;
  classPrice: string;
  setClassPrice: (p: string) => void;
  formSuccess: boolean;
  instructors: Instructor[];
  onSubmit: (e: React.FormEvent) => void;
}

export const SingleSchedulerForm: React.FC<SingleSchedulerFormProps> = ({
  classTitle,
  setClassTitle,
  instructorId,
  setInstructorId,
  roomName,
  setRoomName,
  classDate,
  setClassDate,
  classStartTime,
  setClassStartTime,
  classEndTime,
  setClassEndTime,
  classPrice,
  setClassPrice,
  formSuccess,
  instructors,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Clase de Baile
          </label>
          <select
            value={classTitle}
            onChange={(e) => setClassTitle(e.target.value)}
            className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-green"
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
            value={instructorId}
            onChange={(e) => setInstructorId(e.target.value)}
            className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-green"
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
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-green"
          >
            <option value="Salón Principal">Salón Principal</option>
            <option value="Salón A">Salón A</option>
            <option value="Salón B">Salón B</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Precio de Entrada (S/)
          </label>
          <input
            type="number"
            step="0.01"
            required
            placeholder="Ej. 25.00"
            value={classPrice}
            onChange={(e) => setClassPrice(e.target.value)}
            className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-green"
          />
        </div>

        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Fecha
            </label>
            <input
              type="date"
              required
              value={classDate}
              onChange={(e) => setClassDate(e.target.value)}
              className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-green"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
              Hora Inicio
            </label>
            <select
              value={classStartTime}
              onChange={(e) => setClassStartTime(e.target.value)}
              className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-green font-mono text-sm"
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
              value={classEndTime}
              onChange={(e) => setClassEndTime(e.target.value)}
              className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-green font-mono text-sm"
            >
              {standardHours.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {formSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-semibold flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Clase programada exitosamente. Se ha agregado al listado.
        </div>
      )}

      <button
        type="submit"
        className="w-full py-4 px-6 bg-brand-green hover:bg-brand-green-strong text-slate-950 font-black rounded-xl uppercase tracking-wider text-xs shadow-lg transition-all cursor-pointer"
      >
        Crear Horario de Clase
      </button>
    </form>
  );
};
