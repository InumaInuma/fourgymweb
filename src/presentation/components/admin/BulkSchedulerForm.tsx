import React from 'react';
import type { Instructor } from '../../../domain/entities';

interface BulkSlot {
  id: string;
  title: string;
  instructorId: string;
  roomName: string;
  startTime: string;
  endTime: string;
  price: string;
}

const standardHours = [
  '06:00 a.m.', '07:00 a.m.', '08:00 a.m.', '09:00 a.m.', '10:00 a.m.', '11:00 a.m.', '12:00 p.m.',
  '01:00 p.m.', '02:00 p.m.', '03:00 p.m.', '04:00 p.m.', '05:00 p.m.', '06:00 p.m.', '07:00 p.m.',
  '08:00 p.m.', '09:00 p.m.', '10:00 p.m.', '11:00 p.m.', '12:00 a.m.'
];

const weekDays = [
  { label: 'Lun', value: 1 },
  { label: 'Mar', value: 2 },
  { label: 'Mié', value: 3 },
  { label: 'Jue', value: 4 },
  { label: 'Vie', value: 5 },
  { label: 'Sáb', value: 6 },
  { label: 'Dom', value: 0 },
];

interface BulkSchedulerFormProps {
  bulkStartDate: string;
  setBulkStartDate: (d: string) => void;
  bulkEndDate: string;
  setBulkEndDate: (d: string) => void;
  bulkDays: number[];
  toggleBulkDay: (v: number) => void;
  bulkSlots: BulkSlot[];
  addBulkSlot: () => void;
  removeBulkSlot: (id: string) => void;
  updateBulkSlot: (id: string, field: keyof BulkSlot, value: string) => void;
  getBulkClasesCount: () => number;
  onSubmit: (e: React.FormEvent) => void;
  instructors: Instructor[];
}

export const BulkSchedulerForm: React.FC<BulkSchedulerFormProps> = ({
  bulkStartDate,
  setBulkStartDate,
  bulkEndDate,
  setBulkEndDate,
  bulkDays,
  toggleBulkDay,
  bulkSlots,
  addBulkSlot,
  removeBulkSlot,
  updateBulkSlot,
  getBulkClasesCount,
  onSubmit,
  instructors,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#263238]/20 p-5 rounded-2xl border border-white/5">
        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
            Programar desde el
          </label>
          <input
            type="date"
            required
            value={bulkStartDate}
            onChange={(e) => setBulkStartDate(e.target.value)}
            className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-green"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
            Hasta el (Inclusive)
          </label>
          <input
            type="date"
            required
            value={bulkEndDate}
            onChange={(e) => setBulkEndDate(e.target.value)}
            className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-green"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
            Días de la semana a aplicar
          </label>
          <div className="flex flex-wrap gap-2">
            {weekDays.map((day) => {
              const isActive = bulkDays.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleBulkDay(day.value)}
                  className={`w-12 h-12 rounded-xl text-xs font-black transition-all flex items-center justify-center border cursor-pointer ${
                    isActive
                      ? 'bg-brand-green border-brand-green text-slate-950 shadow-md shadow-brand-green/20'
                      : 'bg-[#263238]/60 border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {day.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Parrilla de Horarios y Profesores
          </h3>
          <button
            type="button"
            onClick={addBulkSlot}
            className="px-3 py-1.5 bg-brand-green/15 hover:bg-brand-green text-brand-green hover:text-slate-950 font-bold rounded-lg transition-all text-xs uppercase tracking-wider cursor-pointer"
          >
            + Agregar Fila
          </button>
        </div>

        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {bulkSlots.map((slot) => (
            <div
              key={slot.id}
              className="flex flex-col md:flex-row items-stretch md:items-end gap-3 bg-[#263238]/30 p-4 rounded-xl border border-white/5 relative"
            >
              <div className="flex-1">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Clase
                </label>
                <select
                  value={slot.title}
                  onChange={(e) => updateBulkSlot(slot.id, 'title', e.target.value)}
                  className="w-full bg-[#263238]/60 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-brand-green"
                >
                  <option value="Salsa & Bachata">Salsa & Bachata</option>
                  <option value="Zumba Fitness">Zumba Fitness</option>
                  <option value="Baile Urbano">Baile Urbano</option>
                  <option value="Ritmos Latinos">Ritmos Latinos</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Profesor
                </label>
                <select
                  value={slot.instructorId}
                  onChange={(e) => updateBulkSlot(slot.id, 'instructorId', e.target.value)}
                  className="w-full bg-[#263238]/60 border border-white/10 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-brand-green"
                >
                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-[105px]">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Inicio
                </label>
                <select
                  value={slot.startTime}
                  onChange={(e) => updateBulkSlot(slot.id, 'startTime', e.target.value)}
                  className="w-full bg-[#263238]/60 border border-white/10 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-brand-green font-mono"
                >
                  {standardHours.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-[105px]">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Fin
                </label>
                <select
                  value={slot.endTime}
                  onChange={(e) => updateBulkSlot(slot.id, 'endTime', e.target.value)}
                  className="w-full bg-[#263238]/60 border border-white/10 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-brand-green font-mono"
                >
                  {standardHours.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full md:w-[110px]">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Salón
                </label>
                <select
                  value={slot.roomName}
                  onChange={(e) => updateBulkSlot(slot.id, 'roomName', e.target.value)}
                  className="w-full bg-[#263238]/60 border border-white/10 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-brand-green"
                >
                  <option value="Salón Principal">Salón Principal</option>
                  <option value="Salón A">Salón A</option>
                  <option value="Salón B">Salón B</option>
                </select>
              </div>

              <div className="w-full md:w-[75px]">
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Precio (S/)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={slot.price}
                  onChange={(e) => updateBulkSlot(slot.id, 'price', e.target.value)}
                  className="w-full bg-[#263238]/60 border border-white/10 rounded-lg px-2 py-2 text-xs text-white text-center font-mono focus:outline-none focus:border-brand-green"
                />
              </div>

              <button
                type="button"
                onClick={() => removeBulkSlot(slot.id)}
                className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-lg border border-red-500/20 hover:border-red-500 transition-all cursor-pointer flex items-center justify-center"
                title="Eliminar Horario"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
        <div className="text-left">
          <span className="text-xs text-slate-400 font-bold block">Resumen de generación:</span>
          <span className="text-sm font-black text-brand-green">
            Se programarán {getBulkClasesCount()} clases en total.
          </span>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto py-3.5 px-8 bg-brand-green hover:bg-brand-green-strong text-slate-950 font-black rounded-xl uppercase tracking-wider text-xs shadow-lg transition-all cursor-pointer"
        >
          Confirmar y Generar Cronograma
        </button>
      </div>
    </form>
  );
};
