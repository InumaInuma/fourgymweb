import React, { useState, useEffect } from 'react';
import type { User } from '../../../domain/entities';
import { apiService } from '../../../data/apiService';

interface TrainerDashboardProps {
  user: User;
  onLogout: () => void;
}

interface Athlete {
  id: string;
  name: string;
  weight: number;
  muscleMass: number;
  bodyFat: number;
  goal: 'Hipertrofia' | 'Definición' | 'Fuerza' | 'Resistencia';
  routine: Exercise[];
  history: ProgressLog[];
}

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  sets: number;
  reps: string;
  weight: string;
  rpe: number;
}

interface ProgressLog {
  date: string;
  weight: number;
  bodyFat: number;
  muscleMass: number;
}

export const TrainerDashboard: React.FC<TrainerDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'athletes'>('home');
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);

  // Exercise builder states
  const [exerciseName, setExerciseName] = useState('Press de Banca');
  const [exerciseGroup, setExerciseGroup] = useState('Pecho');
  const [exerciseSets, setExerciseSets] = useState(4);
  const [exerciseReps, setExerciseReps] = useState('10-12');
  const [exerciseWeight, setExerciseWeight] = useState('60');
  const [exerciseRpe, setExerciseRpe] = useState(8);

  // Progress logger states
  const [logWeight, setLogWeight] = useState('');
  const [logFat, setLogFat] = useState('');
  const [logMuscle, setLogMuscle] = useState('');

  // Notification / toast states
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [athletes, setAthletes] = useState<Athlete[]>([]);

  // Cargar lista de socios reales
  const fetchAthletes = async () => {
    try {
      const sociosList = await apiService.getSocios();
      if (sociosList && sociosList.length > 0) {
        const mapped = sociosList.map((s: any) => ({
          id: s.idSocio.toString(),
          name: `${s.nombre} ${s.apellidoPaterno} ${s.apellidoMaterno}`.toUpperCase(),
          weight: 0,
          muscleMass: 0,
          bodyFat: 0,
          goal: 'Hipertrofia' as const,
          routine: [],
          history: []
        }));
        setAthletes(mapped);
      }
    } catch (err) {
      console.error('Error fetching athletes in trainer dashboard:', err);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, []);

  // Cargar detalles de rutina y progreso de la BD
  const loadAthleteDetails = async (athleteId: string) => {
    try {
      const idSocio = parseInt(athleteId, 10);
      
      // 1. Historial de evaluaciones del entrenador
      const evals = await apiService.getEvaluacionesFisicasTrainer(idSocio);
      const history = evals.map((e: any) => ({
        date: e.fechaEvaluacion.split('T')[0],
        weight: e.peso,
        bodyFat: e.porcentajeGrasa,
        muscleMass: e.masaMuscular
      }));
      
      const latest = evals[0] || null;
      
      // 2. Rutina activa
      const activeRoutine = await apiService.getRutinaActivaTrainer(idSocio);
      const routineExercises = activeRoutine ? activeRoutine.ejercicios.map((ex: any) => ({
        id: ex.id.toString(),
        name: ex.nombreEjercicio,
        muscleGroup: ex.grupoMuscular,
        sets: ex.series,
        reps: ex.repeticiones,
        weight: ex.pesoAsignado || '',
        rpe: ex.rpeObjetivo || 8
      })) : [];
      
      // 3. Actualizar
      setAthletes(prev => prev.map(a => {
        if (a.id === athleteId) {
          const updated = {
            ...a,
            weight: latest ? latest.peso : a.weight,
            muscleMass: latest ? latest.masaMuscular : a.muscleMass,
            bodyFat: latest ? latest.porcentajeGrasa : a.bodyFat,
            goal: activeRoutine ? (activeRoutine.objective as any || 'Hipertrofia') : a.goal,
            routine: routineExercises,
            history: history
          };
          
          // Si es el atleta seleccionado activo, actualizarlo
          setSelectedAthlete(updated);
          return updated;
        }
        return a;
      }));
    } catch (err) {
      console.error('Error loading athlete details:', err);
    }
  };

  const handleSelectAthlete = async (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    await loadAthleteDetails(athlete.id);
  };

  const handleAddExercise = () => {
    if (!selectedAthlete) return;
    const newEx: Exercise = {
      id: Date.now().toString(),
      name: exerciseName,
      muscleGroup: exerciseGroup,
      sets: exerciseSets,
      reps: exerciseReps,
      weight: exerciseWeight,
      rpe: exerciseRpe
    };
    
    // Actualizar localmente
    const updatedRoutine = [...selectedAthlete.routine, newEx];
    setSelectedAthlete({ ...selectedAthlete, routine: updatedRoutine });
    setAthletes(prev => prev.map(a => a.id === selectedAthlete.id ? { ...a, routine: updatedRoutine } : a));
    showToast('Ejercicio agregado a la lista temporal');
  };

  const handleRemoveExercise = (exId: string) => {
    if (!selectedAthlete) return;
    const updatedRoutine = selectedAthlete.routine.filter(e => e.id !== exId);
    
    setSelectedAthlete({ ...selectedAthlete, routine: updatedRoutine });
    setAthletes(prev => prev.map(a => a.id === selectedAthlete.id ? { ...a, routine: updatedRoutine } : a));
    showToast('Ejercicio removido de la lista temporal');
  };

  const handleSaveRoutine = async () => {
    if (!selectedAthlete) return;
    try {
      const success = await apiService.asignarRutinaTrainer({
        idSocio: parseInt(selectedAthlete.id, 10),
        idEntrenador: parseInt(user.id, 10),
        nombreRutina: `Rutina de ${selectedAthlete.goal}`,
        objetivo: selectedAthlete.goal,
        ejercicios: selectedAthlete.routine.map(ex => ({
          nombreEjercicio: ex.name,
          grupoMuscular: ex.muscleGroup,
          series: ex.sets,
          repeticiones: ex.reps,
          pesoAsignado: ex.weight,
          rpeObjetivo: ex.rpe
        })),
        usuarioModificacion: user.name
      });
      if (success) {
        showToast('Rutina guardada en la base de datos');
        await loadAthleteDetails(selectedAthlete.id);
      }
    } catch (err: any) {
      alert(err.message || 'Error al guardar la rutina.');
    }
  };

  const handleSaveProgressLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAthlete || !logWeight || !logFat || !logMuscle) return;

    try {
      const success = await apiService.registrarEvaluacionFisicaTrainer({
        idSocio: parseInt(selectedAthlete.id, 10),
        idEntrenador: parseInt(user.id, 10),
        peso: parseFloat(logWeight),
        masaMuscular: parseFloat(logMuscle),
        porcentajeGrasa: parseFloat(logFat),
        notasEvolucion: `Evaluación registrada por Coach ${user.name}`,
        usuarioModificacion: user.name
      });

      if (success) {
        showToast('Ficha corporal guardada en la BD');
        setLogWeight('');
        setLogFat('');
        setLogMuscle('');
        await loadAthleteDetails(selectedAthlete.id);
      }
    } catch (err: any) {
      alert(err.message || 'Error al guardar las métricas.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f0b21] w-full text-white relative overflow-hidden">
      {/* Glow overlays */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-red-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#141226]/80 backdrop-blur-xl p-6 flex flex-col justify-between z-20 shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              <img src="/logo.png" alt="FourGym Logo" className="w-full h-full object-contain p-0.5" />
            </div>
            <div>
              <span className="text-sm font-black tracking-widest bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent block">FOUR GYM</span>
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Musculación Coach</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-[10px] text-text-secondary font-bold uppercase tracking-widest px-3 mb-2">Entrenamiento</div>
            <button
              onClick={() => { setActiveTab('home'); setSelectedAthlete(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'home' && !selectedAthlete
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-md shadow-red-500/5'
                  : 'text-text-secondary hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              📊 Resumen
            </button>
            <button
              onClick={() => { setActiveTab('athletes'); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'athletes' || selectedAthlete
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20 shadow-md shadow-red-500/5'
                  : 'text-text-secondary hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              🏋️ Mis Atletas
            </button>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-red-500/20 flex items-center justify-center font-bold text-red-400 text-sm">
              {user.initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-white truncate uppercase">{user.name}</p>
              <p className="text-[10px] text-red-400/80 font-semibold uppercase tracking-wider">Coach</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2.5 bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/10 hover:border-red-500/20 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col p-6 md:p-8 overflow-y-auto max-h-screen relative z-10 w-full">
        {/* Welcome Banner */}
        <section className="glass-panel rounded-3xl p-6 border border-white/5 relative overflow-hidden mb-6 shrink-0">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-red-500/10 to-transparent pointer-events-none"></div>
          <span className="text-xs font-bold text-red-400 uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full">
            {user.subscriptionType}
          </span>
          <h1 className="text-2xl font-black text-white mt-3 leading-tight tracking-tight">
            Hola, Coach {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Gestiona las rutinas de tus atletas y audita su progreso físico y masa muscular en tiempo real.
          </p>
        </section>

        {/* Home Overview tab */}
        {activeTab === 'home' && !selectedAthlete && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="glass-card p-5 border border-white/5 rounded-3xl relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 text-6xl opacity-10">🏋️</div>
                <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest">Atletas Activos</p>
                <p className="text-3xl font-black text-white mt-2">{athletes.length}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-bold mt-2">
                  <span>↑ 12% este mes</span>
                </div>
              </div>

              <div className="glass-card p-5 border border-white/5 rounded-3xl relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 text-6xl opacity-10">⏱️</div>
                <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest">Sesiones Hoy</p>
                <p className="text-3xl font-black text-white mt-2">8</p>
                <div className="flex items-center gap-1.5 text-[10px] text-red-400 font-bold mt-2">
                  <span>4 completadas</span>
                </div>
              </div>

              <div className="glass-card p-5 border border-white/5 rounded-3xl relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 text-6xl opacity-10">📋</div>
                <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest">Rutinas Creadas</p>
                <p className="text-3xl font-black text-white mt-2">142</p>
                <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-bold mt-2">
                  <span>De alto rendimiento</span>
                </div>
              </div>
            </div>

            {/* Quick Athletes List */}
            <div className="glass-card p-6 border border-white/5 rounded-3xl">
              <h2 className="text-sm font-black uppercase tracking-wider text-white mb-4">Atletas Recientes</h2>
              <div className="divide-y divide-white/5">
                {athletes.map(a => (
                  <div key={a.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-xs font-bold text-red-400">
                        {a.name.split(' ')[0][0]}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white uppercase">{a.name}</p>
                        <p className="text-[10px] text-text-secondary font-medium">Objetivo: {a.goal}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { handleSelectAthlete(a); setActiveTab('athletes'); }}
                      className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-slate-950 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Ver Rutina
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Athletes List / Details tab */}
        {(activeTab === 'athletes' || selectedAthlete) && (
          <div className="space-y-6">
            {!selectedAthlete ? (
              /* Athletes Table */
              <div className="glass-card p-6 border border-white/5 rounded-3xl">
                <h2 className="text-sm font-black uppercase tracking-wider text-white mb-4">Gestión de Atletas</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs text-slate-300">
                    <thead>
                      <tr className="border-b border-white/5 text-text-secondary uppercase tracking-widest text-[10px] font-bold">
                        <th className="py-3 px-4">Nombre / Atleta</th>
                        <th className="py-3 px-4">Peso</th>
                        <th className="py-3 px-4">Grasa (%)</th>
                        <th className="py-3 px-4">Músculo (kg)</th>
                        <th className="py-3 px-4">Objetivo</th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-semibold">
                      {athletes.map(a => (
                        <tr key={a.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4 text-white font-bold uppercase">{a.name}</td>
                          <td className="py-4 px-4 font-mono">{a.weight} kg</td>
                          <td className="py-4 px-4 font-mono">{a.bodyFat}%</td>
                          <td className="py-4 px-4 font-mono">{a.muscleMass} kg</td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold">
                              {a.goal}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => handleSelectAthlete(a)}
                              className="px-3.5 py-1.5 bg-red-500/15 hover:bg-red-500 text-red-400 hover:text-slate-950 font-bold rounded-xl transition-all text-[10px] uppercase tracking-wider cursor-pointer"
                            >
                              Gestionar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Athlete Details view with routine builder and progress logger */
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Left: Routine builder and exercises list */}
                <div className="xl:col-span-2 space-y-6">
                  <div className="glass-card p-6 border border-white/5 rounded-3xl">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                      <div>
                        <button
                          onClick={() => setSelectedAthlete(null)}
                          className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-widest mb-1.5 flex items-center gap-1 transition-all cursor-pointer"
                        >
                          ← Volver al listado
                        </button>
                        <h2 className="text-lg font-black text-white uppercase tracking-tight">Rutina de {selectedAthlete.name}</h2>
                        <p className="text-xs text-text-secondary">Objetivo Físico: <span className="text-red-400 font-bold">{selectedAthlete.goal}</span></p>
                      </div>
                    </div>

                    {/* Active exercises list */}
                    <div className="space-y-3 mb-8">
                      <h3 className="text-xs font-black text-white uppercase tracking-widest">Ejercicios Programados</h3>
                      {selectedAthlete.routine.length === 0 ? (
                        <p className="text-slate-500 text-xs py-4 text-center">No hay ejercicios asignados en esta rutina.</p>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {selectedAthlete.routine.map(ex => (
                            <div key={ex.id} className="flex items-center justify-between p-4 bg-slate-950/40 border border-white/5 rounded-2xl hover:border-red-500/20 transition-all">
                              <div>
                                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider bg-red-500/10 px-2 py-0.5 rounded-full">{ex.muscleGroup}</span>
                                <p className="text-sm font-bold text-white mt-1.5 uppercase">{ex.name}</p>
                                <p className="text-xs text-text-secondary mt-0.5">
                                  <span className="font-semibold text-slate-200">{ex.sets}</span> Series • <span className="font-semibold text-slate-200">{ex.reps}</span> Reps • <span className="font-semibold text-slate-200">{ex.weight} kg</span> • RPE <span className="text-red-400 font-bold">{ex.rpe}</span>
                                </p>
                              </div>
                              <button
                                onClick={() => handleRemoveExercise(ex.id)}
                                className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-slate-950 flex items-center justify-center transition-all cursor-pointer text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                          <div className="flex justify-end pt-3">
                            <button
                              onClick={handleSaveRoutine}
                              className="px-5 py-3 bg-gradient-to-r from-red-500 to-amber-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer hover:opacity-90 shadow-md shadow-red-500/15"
                            >
                              💾 Guardar Rutina en Base de Datos
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Routine creator form */}
                    <div className="border-t border-white/5 pt-6 space-y-4">
                      <h3 className="text-xs font-black text-white uppercase tracking-widest">Agregar Ejercicio</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Nombre del Ejercicio</label>
                          <input
                            type="text"
                            value={exerciseName}
                            onChange={(e) => setExerciseName(e.target.value)}
                            className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                            placeholder="Ej. Press de Banca"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Grupo Muscular</label>
                          <select
                            value={exerciseGroup}
                            onChange={(e) => setExerciseGroup(e.target.value)}
                            className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                          >
                            <option value="Pecho">Pecho</option>
                            <option value="Espalda">Espalda</option>
                            <option value="Piernas">Piernas</option>
                            <option value="Hombros">Hombros</option>
                            <option value="Brazos">Brazos</option>
                            <option value="Core">Core</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Series</label>
                          <input
                            type="number"
                            value={exerciseSets}
                            onChange={(e) => setExerciseSets(parseInt(e.target.value, 10))}
                            className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Repeticiones</label>
                          <input
                            type="text"
                            value={exerciseReps}
                            onChange={(e) => setExerciseReps(e.target.value)}
                            className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                            placeholder="Ej. 10-12"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Peso de Carga (kg)</label>
                          <input
                            type="text"
                            value={exerciseWeight}
                            onChange={(e) => setExerciseWeight(e.target.value)}
                            className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                            placeholder="Ej. 60"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Esfuerzo RPE (1 - 10)</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={exerciseRpe}
                            onChange={(e) => setExerciseRpe(parseInt(e.target.value, 10))}
                            className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleAddExercise}
                        className="w-full py-2.5 bg-red-500 hover:bg-red-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer mt-2"
                      >
                        Añadir Ejercicio a la Rutina
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Metrics logger and physical metrics history */}
                <div className="space-y-6">
                  <div className="glass-card p-6 border border-white/5 rounded-3xl">
                    <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4">Registrar Avance Físico</h3>
                    <form onSubmit={handleSaveProgressLog} className="space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Peso Corporal (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={logWeight}
                          onChange={(e) => setLogWeight(e.target.value)}
                          className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                          placeholder="Ej. 78.5"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Grasa Corporal (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={logFat}
                          onChange={(e) => setLogFat(e.target.value)}
                          className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                          placeholder="Ej. 14.5"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Masa Muscular (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={logMuscle}
                          onChange={(e) => setLogMuscle(e.target.value)}
                          className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                          placeholder="Ej. 36.2"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-slate-950 border border-red-500/25 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer mt-2"
                      >
                        Guardar Ficha Corporal
                      </button>
                    </form>
                  </div>

                  {/* Physical history log list */}
                  <div className="glass-card p-6 border border-white/5 rounded-3xl">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">Historial Antropométrico</h3>
                    <div className="space-y-4">
                      {selectedAthlete.history.map((h, i) => (
                        <div key={i} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                          <p className="text-[10px] text-red-400 font-bold">{h.date}</p>
                          <div className="grid grid-cols-3 gap-2 mt-1.5 text-slate-300 font-semibold text-[10px]">
                            <div>
                              <p className="text-slate-500 text-[8px] uppercase font-bold">Peso</p>
                              <p>{h.weight} kg</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-[8px] uppercase font-bold">Grasa</p>
                              <p>{h.bodyFat}%</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-[8px] uppercase font-bold">Músculo</p>
                              <p>{h.muscleMass} kg</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-red-500 text-slate-950 px-4 py-2.5 rounded-2xl font-black uppercase text-[10px] tracking-wider shadow-lg shadow-red-500/20 animate-bounce">
          ✓ {toastMessage}
        </div>
      )}
    </div>
  );
};
