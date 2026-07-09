import React, { useState, useEffect } from 'react';
import { apiService, type Rutina } from '../../../data/apiService';

interface MemberRoutineProps {
  idSocio: number;
}

const DAYS_OF_WEEK = [
  { id: 1, name: 'Lunes' },
  { id: 2, name: 'Martes' },
  { id: 3, name: 'Miércoles' },
  { id: 4, name: 'Jueves' },
  { id: 5, name: 'Viernes' },
  { id: 6, name: 'Sábado' },
];

export const MemberRoutine: React.FC<MemberRoutineProps> = ({ idSocio }) => {
  const [rutina, setRutina] = useState<Rutina | null>(null);
  const [selectedDay, setSelectedDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRoutine = async () => {
      try {
        setLoading(true);
        const data = await apiService.getSocioRutinaActiva(idSocio);
        setRutina(data);
      } catch (err: any) {
        setError(err.message || 'Error al obtener rutina de entrenamiento.');
      } finally {
        setLoading(false);
      }
    };
    loadRoutine();
  }, [idSocio]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !rutina || !rutina.ejercicios || rutina.ejercicios.length === 0) {
    return (
      <div className="p-6 bg-slate-900 border border-white/5 rounded-3xl text-center text-xs text-text-secondary space-y-2">
        <p>⚠️ Aún no tienes una rutina de ejercicios activa asignada por tu entrenador.</p>
        <p className="text-[10px] text-brand-green uppercase font-black">Solicita tu evaluación física en recepción</p>
      </div>
    );
  }

  // Filter exercises for the selected day
  const dailyExercises = rutina.ejercicios.filter(e => e.diaSemana === selectedDay);

  return (
    <div className="space-y-6">
      
      {/* Routine Info Header */}
      <div className="glass-panel border border-white/5 rounded-3xl p-6 bg-gradient-to-br from-[#1b1c36] to-[#110f22]">
        <span className="text-[10px] font-black uppercase bg-accent-cyan/15 text-accent-cyan px-2.5 py-1 rounded-lg border border-accent-cyan/20">
          Entrenamiento Activo
        </span>
        <h2 className="text-xl font-black text-white mt-3 tracking-tight">
          {rutina.nombreRutina}
        </h2>
        {rutina.objetivo && (
          <p className="text-xs text-text-secondary mt-1 font-semibold">
            Objetivo: <span className="text-white">{rutina.objetivo}</span>
          </p>
        )}
        <p className="text-[10px] text-slate-400 font-mono mt-1">Asignada el {new Date(rutina.fechaAsignacion).toLocaleDateString()}</p>
      </div>

      {/* Days Tabs Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {DAYS_OF_WEEK.map((day) => {
          const isActive = selectedDay === day.id;
          const hasExercises = rutina.ejercicios.some(e => e.diaSemana === day.id);
          return (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className={`py-2 px-3 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-green border-brand-green text-slate-950 shadow-lg shadow-brand-green/10'
                  : 'bg-[#141226]/50 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
              } relative`}
            >
              {day.name}
              {hasExercises && !isActive && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-brand-green rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Exercises List */}
      <div className="glass-panel border border-white/5 rounded-3xl p-6 space-y-4">
        <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
          <span className="w-1 h-3.5 bg-brand-green rounded-full"></span>
          Ejercicios del día
        </h3>

        {dailyExercises.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-secondary">
            Día de descanso. ¡Recupera tus músculos hoy! 😴
          </div>
        ) : (
          <div className="divide-y divide-white/5 space-y-4">
            {dailyExercises.map((ex, idx) => (
              <div key={ex.id || idx} className="pt-4 first:pt-0 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-bold text-white text-xs">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm leading-tight">{ex.nombreEjercicio}</h4>
                    <p className="text-[10px] text-text-secondary mt-0.5 uppercase font-black tracking-wider">{ex.grupoMuscular}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="bg-[#141226] border border-white/5 px-3 py-1.5 rounded-xl font-mono text-center min-w-[70px]">
                    <span className="text-[9px] text-text-secondary uppercase tracking-widest block">Series</span>
                    <span className="text-white font-bold">{ex.series}</span>
                  </div>
                  <div className="bg-[#141226] border border-white/5 px-3 py-1.5 rounded-xl font-mono text-center min-w-[70px]">
                    <span className="text-[9px] text-text-secondary uppercase tracking-widest block">Reps</span>
                    <span className="text-white font-bold">{ex.repeticiones}</span>
                  </div>
                  {ex.pesoAsignado && (
                    <div className="bg-[#141226] border border-white/5 px-3 py-1.5 rounded-xl font-mono text-center min-w-[70px]">
                      <span className="text-[9px] text-text-secondary uppercase tracking-widest block">Peso</span>
                      <span className="text-brand-green font-black">{ex.pesoAsignado}</span>
                    </div>
                  )}
                  {ex.rpeObjetivo && (
                    <div className="bg-[#141226] border border-white/5 px-3 py-1.5 rounded-xl font-mono text-center min-w-[70px]">
                      <span className="text-[9px] text-text-secondary uppercase tracking-widest block">RPE</span>
                      <span className="text-amber-400 font-bold">{ex.rpeObjetivo} / 10</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
