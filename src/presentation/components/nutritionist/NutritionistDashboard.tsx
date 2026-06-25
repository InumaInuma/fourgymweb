import React, { useState, useEffect } from 'react';
import type { User } from '../../../domain/entities';
import { apiService } from '../../../data/apiService';

interface NutritionistDashboardProps {
  user: User;
  onLogout: () => void;
}

interface Patient {
  id: string;
  name: string;
  weight: number;
  bodyFat: number;
  musclePercentage: number;
  visceralFat: number;
  metabolicAge: number;
  goal: 'Pérdida de Peso' | 'Aumento de Masa' | 'Mantenimiento' | 'Salud y Bienestar';
  meals: MealPlan;
  history: AntropometriaLog[];
}

interface MealPlan {
  desayuno: string;
  colacion1: string;
  almuerzo: string;
  merienda: string;
  cena: string;
  calories: number;
  proteinPct: number; // e.g. 30%
  carbPct: number;    // e.g. 40%
  fatPct: number;     // e.g. 30%
}

interface AntropometriaLog {
  date: string;
  weight: number;
  bodyFat: number;
  musclePercentage: number;
  visceralFat: number;
}

export const NutritionistDashboard: React.FC<NutritionistDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'patients'>('home');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Meal and macros builder states
  const [targetCalories, setTargetCalories] = useState(2000);
  const [proteinPct, setProteinPct] = useState(30);
  const [carbPct, setCarbPct] = useState(45);
  const [fatPct, setFatPct] = useState(25);

  const [desayuno, setDesayuno] = useState('3 Claras de huevo, 1 yema + 1 taza de avena con fresas');
  const [colacion1, setColacion1] = useState('1 Manzana verde + 15g de almendras');
  const [almuerzo, setAlmuerzo] = useState('150g de Pechuga de pollo a la plancha + 120g de arroz integral + ensalada verde');
  const [merienda, setMerienda] = useState('1 Batido de proteína de suero (whey) + 1 plátano mediano');
  const [cena, setCena] = useState('150g de filete de salmón + espárragos al vapor + 100g de camote cocido');

  // Clinical history states
  const [objetivoGeneral, setObjetivoGeneral] = useState('Salud y Bienestar');
  const [antecedentesMedicos, setAntecedentesMedicos] = useState('');
  const [alergiasAlimentarias, setAlergiasAlimentarias] = useState('');
  const [observacionesClinicas, setObservacionesClinicas] = useState('');

  // Anthropometry form states
  const [logWeight, setLogWeight] = useState('');
  const [logFat, setLogFat] = useState('');
  const [logMuscle, setLogMuscle] = useState('');
  const [logVisceral, setLogVisceral] = useState('4');
  const [logMetabolicAge, setLogMetabolicAge] = useState('25');

  // Notification / toast states
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const [patients, setPatients] = useState<Patient[]>([]);

  // Cargar lista de socios reales
  const fetchPatients = async () => {
    try {
      const sociosList = await apiService.getSocios();
      if (sociosList && sociosList.length > 0) {
        const mapped = sociosList.map((s: any) => ({
          id: s.idSocio.toString(),
          name: `${s.nombre} ${s.apellidoPaterno} ${s.apellidoMaterno}`.toUpperCase(),
          weight: 0,
          bodyFat: 0,
          musclePercentage: 0,
          visceralFat: 0,
          metabolicAge: 0,
          goal: 'Salud y Bienestar' as const,
          meals: {
            desayuno: '',
            colacion1: '',
            almuerzo: '',
            merienda: '',
            cena: '',
            calories: 2000,
            proteinPct: 30,
            carbPct: 40,
            fatPct: 30
          },
          history: []
        }));
        setPatients(mapped);

        // Fetch latest evaluation for each patient in the background
        for (const p of mapped) {
          try {
            const evals = await apiService.getEvaluacionesAntropometricas(parseInt(p.id, 10));
            if (evals && evals.length > 0) {
              const latest = evals[0];
              setPatients(prev => prev.map(item => {
                if (item.id === p.id) {
                  return {
                    ...item,
                    weight: parseFloat(latest.peso),
                    bodyFat: parseFloat(latest.porcentajeGrasa),
                    musclePercentage: parseFloat(latest.porcentajeMusculo),
                    visceralFat: parseInt(latest.grasaVisceral, 10),
                    metabolicAge: parseInt(latest.edadMetabolica, 10)
                  };
                }
                return item;
              }));
            }
          } catch (e) {
            console.error(`Error loading initial evaluation for patient ${p.id}:`, e);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // Cargar detalles de ficha clínica, bioimpedancia y plan activo
  const loadPatientDetails = async (patientId: string) => {
    try {
      const idSocio = parseInt(patientId, 10);
      
      // 1. Obtener Historial Clínico
      const clinicalHistory = await apiService.getHistorialClinico(idSocio);
      
      // 2. Obtener Evaluaciones Antropométricas (Bioimpedancia)
      const evals = await apiService.getEvaluacionesAntropometricas(idSocio);
      const history = evals.map((e: any) => ({
        date: e.fechaEvaluacion ? e.fechaEvaluacion.split('T')[0] : new Date().toLocaleDateString('sv-SE'),
        weight: parseFloat(e.peso),
        bodyFat: parseFloat(e.porcentajeGrasa),
        musclePercentage: parseFloat(e.porcentajeMusculo),
        visceralFat: parseInt(e.grasaVisceral, 10)
      }));
      
      const latestEval = evals[0] || null;

      // 3. Obtener Plan Alimentario Activo
      const activePlan = await apiService.getPlanAlimentarioActivo(idSocio);
      const meals = activePlan ? {
        desayuno: activePlan.desayuno,
        colacion1: activePlan.colacion1 || '',
        almuerzo: activePlan.almuerzo,
        merienda: activePlan.merienda || '',
        cena: activePlan.cena,
        calories: activePlan.caloriasObjetivo,
        proteinPct: activePlan.porcentajeProteina,
        carbPct: activePlan.porcentajeCarbohidratos,
        fatPct: activePlan.porcentajeGrasa
      } : {
        desayuno: '',
        colacion1: '',
        almuerzo: '',
        merienda: '',
        cena: '',
        calories: 2000,
        proteinPct: 30,
        carbPct: 40,
        fatPct: 30
      };

      // 4. Actualizar paciente en la lista y estado seleccionado
      setPatients(prev => prev.map(p => {
        if (p.id === patientId) {
          const updated: Patient = {
            ...p,
            weight: latestEval ? parseFloat(latestEval.peso) : 0,
            bodyFat: latestEval ? parseFloat(latestEval.porcentajeGrasa) : 0,
            musclePercentage: latestEval ? parseFloat(latestEval.porcentajeMusculo) : 0,
            visceralFat: latestEval ? parseInt(latestEval.grasaVisceral, 10) : 0,
            metabolicAge: latestEval ? parseInt(latestEval.edadMetabolica, 10) : 0,
            goal: clinicalHistory ? (clinicalHistory.objetivoGeneral as any || 'Salud y Bienestar') : 'Salud y Bienestar',
            meals,
            history
          };
          
          // Actualizar seleccionado si coincide
          setSelectedPatient(updated);
          
          // Llenar estados del formulario con el plan activo si existe o defaults
          setTargetCalories(meals.calories);
          setProteinPct(meals.proteinPct);
          setCarbPct(meals.carbPct);
          setFatPct(meals.fatPct);
          setDesayuno(meals.desayuno || '3 Claras de huevo, 1 yema + 1 taza de avena con fresas');
          setColacion1(meals.colacion1 || '1 Manzana verde + 15g de almendras');
          setAlmuerzo(meals.almuerzo || '150g de Pechuga de pollo a la plancha + 120g de arroz integral + ensalada verde');
          setMerienda(meals.merienda || '1 Batido de proteína de suero (whey) + 1 plátano mediano');
          setCena(meals.cena || '150g de filete de salmón + espárragos al vapor + 100g de camote cocido');

          // Llenar estados del historial clínico
          setObjetivoGeneral(clinicalHistory ? clinicalHistory.objetivoGeneral : 'Salud y Bienestar');
          setAntecedentesMedicos(clinicalHistory ? clinicalHistory.antecedentesMedicos || '' : '');
          setAlergiasAlimentarias(clinicalHistory ? clinicalHistory.alergiasAlimentarias || '' : '');
          setObservacionesClinicas(clinicalHistory ? clinicalHistory.observaciones || '' : '');

          return updated;
        }
        return p;
      }));

    } catch (err) {
      console.error('Error loading patient details:', err);
    }
  };

  const selectPatientForDiet = (patient: Patient) => {
    setSelectedPatient(patient);
    loadPatientDetails(patient.id);
  };

  // Calculations for grams of macronutrients
  const calcGrams = (calories: number, percentage: number, type: 'protein' | 'carb' | 'fat') => {
    const factor = type === 'fat' ? 9 : 4;
    return Math.round(((calories * (percentage / 100)) / factor));
  };

  const handleSaveMealPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    if (proteinPct + carbPct + fatPct !== 100) {
      alert('La suma de los porcentajes de macros (Proteína, Carbohidrato y Grasa) debe ser exactamente 100%. Actualmente suma ' + (proteinPct + carbPct + fatPct) + '%');
      return;
    }

    try {
      const success = await apiService.guardarPlanAlimentario({
        idSocio: parseInt(selectedPatient.id, 10),
        idNutricionista: parseInt(user.id, 10),
        caloriasObjetivo: targetCalories,
        porcentajeProteina: proteinPct,
        porcentajeCarbohidratos: carbPct,
        porcentajeGrasa: fatPct,
        desayuno,
        colacion1,
        almuerzo,
        merienda,
        cena,
        usuarioModificacion: user.name
      });

      if (success) {
        showToast('Plan alimentario y macros guardados con éxito');
        await loadPatientDetails(selectedPatient.id);
      }
    } catch (err: any) {
      alert(err.message || 'Error al guardar el plan alimentario.');
    }
  };

  const handleSaveAnthropometry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !logWeight || !logFat || !logMuscle) return;

    try {
      const success = await apiService.registrarEvaluacionAntropometrica({
        idSocio: parseInt(selectedPatient.id, 10),
        idNutricionista: parseInt(user.id, 10),
        peso: parseFloat(logWeight),
        porcentajeGrasa: parseFloat(logFat),
        porcentajeMusculo: parseFloat(logMuscle),
        grasaVisceral: parseInt(logVisceral, 10),
        edadMetabolica: parseInt(logMetabolicAge, 10),
        usuarioModificacion: user.name
      });

      if (success) {
        setLogWeight('');
        setLogFat('');
        setLogMuscle('');
        setLogVisceral('4');
        setLogMetabolicAge('25');
        showToast('Evaluación antropométrica registrada');
        await loadPatientDetails(selectedPatient.id);
      }
    } catch (err: any) {
      alert(err.message || 'Error al registrar la evaluación.');
    }
  };

  const handleSaveClinicalHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    try {
      const success = await apiService.guardarHistorialClinico({
        idSocio: parseInt(selectedPatient.id, 10),
        idNutricionista: parseInt(user.id, 10),
        objetivoGeneral: objetivoGeneral,
        antecedentesMedicos: antecedentesMedicos || undefined,
        alergiasAlimentarias: alergiasAlimentarias || undefined,
        observaciones: observacionesClinicas || undefined,
        usuarioModificacion: user.name
      });

      if (success) {
        showToast('Ficha clínica guardada con éxito');
        await loadPatientDetails(selectedPatient.id);
      }
    } catch (err: any) {
      alert(err.message || 'Error al guardar la ficha clínica.');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f0b21] w-full text-white relative overflow-hidden">
      {/* Glow overlays */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#141226]/80 backdrop-blur-xl p-6 flex flex-col justify-between z-20 shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-white/5 pb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
              <img src="/logo.png" alt="FourGym Logo" className="w-full h-full object-contain p-0.5" />
            </div>
            <div>
              <span className="text-sm font-black tracking-widest bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent block">FOUR GYM</span>
              <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Nutricionista Staff</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-[10px] text-text-secondary font-bold uppercase tracking-widest px-3 mb-2">Nutrición</div>
            <button
              onClick={() => { setActiveTab('home'); setSelectedPatient(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'home' && !selectedPatient
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-md shadow-amber-500/5'
                  : 'text-text-secondary hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              📊 Resumen
            </button>
            <button
              onClick={() => { setActiveTab('patients'); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'patients' || selectedPatient
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-md shadow-amber-500/5'
                  : 'text-text-secondary hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              🍎 Pacientes
            </button>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center font-bold text-amber-400 text-sm">
              {user.initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-white truncate uppercase">{user.name}</p>
              <p className="text-[10px] text-amber-400/80 font-semibold uppercase tracking-wider">Nutricionista</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full py-2.5 bg-white/5 hover:bg-amber-500/10 hover:text-amber-400 border border-white/10 hover:border-amber-500/20 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col p-6 md:p-8 overflow-y-auto max-h-screen relative z-10 w-full">
        {/* Welcome Banner */}
        <section className="glass-panel rounded-3xl p-6 border border-white/5 relative overflow-hidden mb-6 shrink-0">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none"></div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-500/10 px-3 py-1 rounded-full">
            {user.subscriptionType}
          </span>
          <h1 className="text-2xl font-black text-white mt-3 leading-tight tracking-tight">
            Hola, Lic. {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Diseña planes nutricionales y realiza el seguimiento antropométrico y composición corporal de los socios del gimnasio.
          </p>
        </section>

        {/* Home Overview tab */}
        {activeTab === 'home' && !selectedPatient && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="glass-card p-5 border border-white/5 rounded-3xl relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 text-6xl opacity-10">🥗</div>
                <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest">Pacientes Activos</p>
                <p className="text-3xl font-black text-white mt-2">{patients.length}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-bold mt-2">
                  <span>↑ 8% este mes</span>
                </div>
              </div>

              <div className="glass-card p-5 border border-white/5 rounded-3xl relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 text-6xl opacity-10">🗓️</div>
                <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest">Citas Hoy</p>
                <p className="text-3xl font-black text-white mt-2">5</p>
                <div className="flex items-center gap-1.5 text-[10px] text-amber-400 font-bold mt-2">
                  <span>2 evaluadas</span>
                </div>
              </div>

              <div className="glass-card p-5 border border-white/5 rounded-3xl relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 text-6xl opacity-10">⚖️</div>
                <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest">Planes de Dietas</p>
                <p className="text-3xl font-black text-white mt-2">89</p>
                <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-bold mt-2">
                  <span>Con macros personalizados</span>
                </div>
              </div>
            </div>

            {/* Patients List card */}
            <div className="glass-card p-6 border border-white/5 rounded-3xl">
              <h2 className="text-sm font-black uppercase tracking-wider text-white mb-4">Pacientes Recientes</h2>
              <div className="divide-y divide-white/5">
                {patients.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-xs font-bold text-amber-400">
                        {p.name.split(' ')[0][0] || 'G'}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white uppercase">{p.name}</p>
                        <p className="text-[10px] text-text-secondary font-medium">Objetivo: {p.goal}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { selectPatientForDiet(p); setActiveTab('patients'); }}
                      className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Evaluar Dietas
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Patients / Evaluation tab */}
        {(activeTab === 'patients' || selectedPatient) && (
          <div className="space-y-6">
            {!selectedPatient ? (
              /* Patients Table */
              <div className="glass-card p-6 border border-white/5 rounded-3xl">
                <h2 className="text-sm font-black uppercase tracking-wider text-white mb-4">Control de Pacientes</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs text-slate-300">
                    <thead>
                      <tr className="border-b border-white/5 text-text-secondary uppercase tracking-widest text-[10px] font-bold">
                        <th className="py-3 px-4">Nombre / Paciente</th>
                        <th className="py-3 px-4">Peso</th>
                        <th className="py-3 px-4">Grasa Corporal</th>
                        <th className="py-3 px-4">Músculo (%)</th>
                        <th className="py-3 px-4">Grasa Visceral</th>
                        <th className="py-3 px-4">Edad Metabólica</th>
                        <th className="py-3 px-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-semibold">
                      {patients.map(p => (
                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-4 px-4 text-white font-bold uppercase">{p.name}</td>
                          <td className="py-4 px-4 font-mono">{p.weight > 0 ? `${p.weight} kg` : 'Sin evaluar'}</td>
                          <td className="py-4 px-4 font-mono">{p.bodyFat > 0 ? `${p.bodyFat}%` : 'Sin evaluar'}</td>
                          <td className="py-4 px-4 font-mono">{p.musclePercentage > 0 ? `${p.musclePercentage}%` : 'Sin evaluar'}</td>
                          <td className="py-4 px-4 font-mono">{p.visceralFat > 0 ? `Nivel ${p.visceralFat}` : 'Sin evaluar'}</td>
                          <td className="py-4 px-4 font-mono">{p.metabolicAge > 0 ? `${p.metabolicAge} años` : 'Sin evaluar'}</td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => selectPatientForDiet(p)}
                              className="px-3.5 py-1.5 bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-bold rounded-xl transition-all text-[10px] uppercase tracking-wider cursor-pointer"
                            >
                              Evaluar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Patient details: Meal Plan creator and Anthropometry logger */
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Left: Clinical History and Meal plan creator */}
                <div className="xl:col-span-2 space-y-6">
                  
                  {/* Ficha Clínica Card */}
                  <div className="glass-card p-6 border border-white/5 rounded-3xl">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                      <div>
                        <button
                          onClick={() => setSelectedPatient(null)}
                          className="text-[10px] font-bold text-amber-400 hover:text-amber-300 uppercase tracking-widest mb-1.5 flex items-center gap-1 transition-all cursor-pointer"
                        >
                          ← Volver al listado
                        </button>
                        <h2 className="text-lg font-black text-white uppercase tracking-tight">Ficha Clínica: {selectedPatient.name}</h2>
                        <p className="text-xs text-text-secondary">Información y antecedentes médicos generales.</p>
                      </div>
                    </div>

                    <form onSubmit={handleSaveClinicalHistory} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Objetivo Nutricional</label>
                          <select
                            value={objetivoGeneral}
                            onChange={(e) => setObjetivoGeneral(e.target.value)}
                            className="bg-[#0f0b21] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                          >
                            <option value="Pérdida de Peso">Pérdida de Peso</option>
                            <option value="Aumento de Masa">Aumento de Masa</option>
                            <option value="Mantenimiento">Mantenimiento</option>
                            <option value="Salud y Bienestar">Salud y Bienestar</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Alergias Alimentarias</label>
                          <input
                            type="text"
                            value={alergiasAlimentarias}
                            onChange={(e) => setAlergiasAlimentarias(e.target.value)}
                            className="bg-[#0f0b21] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                            placeholder="Ej. Lactosa, gluten, nueces, ninguna"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Antecedentes Médicos / Patologías</label>
                        <textarea
                          rows={2}
                          value={antecedentesMedicos}
                          onChange={(e) => setAntecedentesMedicos(e.target.value)}
                          className="bg-[#0f0b21] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                          placeholder="Ej. Gastritis, resistencia a la insulina, hipotiroidismo..."
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Observaciones Generales / Estilo de Vida</label>
                        <textarea
                          rows={2}
                          value={observacionesClinicas}
                          onChange={(e) => setObservacionesClinicas(e.target.value)}
                          className="bg-[#0f0b21] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                          placeholder="Ej. Trabaja sentado, realiza actividad física moderada..."
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/25 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Guardar Ficha Clínica
                      </button>
                    </form>
                  </div>

                  {/* Plan Alimentario Card */}
                  <div className="glass-card p-6 border border-white/5 rounded-3xl">
                    <div className="border-b border-white/5 pb-4 mb-6">
                      <h2 className="text-lg font-black text-white uppercase tracking-tight">Plan Nutripersonalizado</h2>
                      <p className="text-xs text-text-secondary">Objetivo Actual: <span className="text-amber-400 font-bold">{selectedPatient.goal}</span></p>
                    </div>

                    {/* Macros Calculator Widget */}
                    <div className="bg-slate-950/40 border border-white/5 rounded-2xl p-5 mb-6 space-y-4">
                      <h3 className="text-xs font-black text-white uppercase tracking-widest">Calculadora de Macros Personalizados</h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[8px] text-text-secondary font-bold uppercase tracking-wider">Calorías Meta (kcal)</label>
                          <input
                            type="number"
                            value={targetCalories}
                            onChange={(e) => setTargetCalories(parseInt(e.target.value, 10))}
                            className="bg-[#0f0b21] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[8px] text-text-secondary font-bold uppercase tracking-wider">Proteínas (%)</label>
                          <input
                            type="number"
                            value={proteinPct}
                            onChange={(e) => setProteinPct(parseInt(e.target.value, 10))}
                            className="bg-[#0f0b21] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[8px] text-text-secondary font-bold uppercase tracking-wider">Carbohidratos (%)</label>
                          <input
                            type="number"
                            value={carbPct}
                            onChange={(e) => setCarbPct(parseInt(e.target.value, 10))}
                            className="bg-[#0f0b21] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[8px] text-text-secondary font-bold uppercase tracking-wider">Grasas (%)</label>
                          <input
                            type="number"
                            value={fatPct}
                            onChange={(e) => setFatPct(parseInt(e.target.value, 10))}
                            className="bg-[#0f0b21] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                          />
                        </div>
                      </div>

                      {/* Calibrated grams results */}
                      <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-2.5">
                          <p className="text-[8px] text-red-400 font-bold uppercase">Proteína (4 kcal/g)</p>
                          <p className="text-sm font-black text-white mt-0.5 font-mono">{calcGrams(targetCalories, proteinPct, 'protein')}g</p>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-2.5">
                          <p className="text-[8px] text-amber-400 font-bold uppercase">Carbohidratos (4 kcal/g)</p>
                          <p className="text-sm font-black text-white mt-0.5 font-mono">{calcGrams(targetCalories, carbPct, 'carb')}g</p>
                        </div>
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-2.5">
                          <p className="text-[8px] text-orange-400 font-bold uppercase">Grasas (9 kcal/g)</p>
                          <p className="text-sm font-black text-white mt-0.5 font-mono">{calcGrams(targetCalories, fatPct, 'fat')}g</p>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 font-bold text-center">
                        Distribución de macros: <span className={proteinPct + carbPct + fatPct === 100 ? 'text-green-400' : 'text-red-400'}>{proteinPct + carbPct + fatPct}%</span> / 100%
                      </div>
                    </div>

                    {/* Meal Plan Form */}
                    <form onSubmit={handleSaveMealPlan} className="space-y-4">
                      <h3 className="text-xs font-black text-white uppercase tracking-widest">Planificador de Comidas Diarias</h3>
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Desayuno</label>
                        <textarea
                          rows={2}
                          value={desayuno}
                          onChange={(e) => setDesayuno(e.target.value)}
                          className="bg-[#0f0b21] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Media Mañana (Colación)</label>
                        <textarea
                          rows={2}
                          value={colacion1}
                          onChange={(e) => setColacion1(e.target.value)}
                          className="bg-[#0f0b21] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Almuerzo</label>
                        <textarea
                          rows={2}
                          value={almuerzo}
                          onChange={(e) => setAlmuerzo(e.target.value)}
                          className="bg-[#0f0b21] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Merienda (Tarde)</label>
                        <textarea
                          rows={2}
                          value={merienda}
                          onChange={(e) => setMerienda(e.target.value)}
                          className="bg-[#0f0b21] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Cena</label>
                        <textarea
                          rows={2}
                          value={cena}
                          onChange={(e) => setCena(e.target.value)}
                          className="bg-[#0f0b21] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer mt-2"
                      >
                        Guardar Plan Alimentario y Macros
                      </button>
                    </form>
                  </div>
                </div>

                {/* Right: Anthropometry Log Form and progress history */}
                <div className="space-y-6">
                  <div className="glass-card p-6 border border-white/5 rounded-3xl">
                    <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4">Registrar Evaluación Corporal</h3>
                    <form onSubmit={handleSaveAnthropometry} className="space-y-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Peso de Control (kg)</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={logWeight}
                          onChange={(e) => setLogWeight(e.target.value)}
                          className="bg-[#0f0b21] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                          placeholder="Ej. 78.5"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Porcentaje de Grasa (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={logFat}
                          onChange={(e) => setLogFat(e.target.value)}
                          className="bg-[#0f0b21] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                          placeholder="Ej. 14.5"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Porcentaje de Músculo (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={logMuscle}
                          onChange={(e) => setLogMuscle(e.target.value)}
                          className="bg-[#0f0b21] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                          placeholder="Ej. 42.1"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Nivel Grasa Visceral (1 - 30)</label>
                        <input
                          type="number"
                          required
                          value={logVisceral}
                          onChange={(e) => setLogVisceral(e.target.value)}
                          className="bg-[#0f0b21] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] text-text-secondary font-bold uppercase tracking-wider">Edad Metabólica (años)</label>
                        <input
                          type="number"
                          required
                          value={logMetabolicAge}
                          onChange={(e) => setLogMetabolicAge(e.target.value)}
                          className="bg-[#0f0b21] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                          placeholder="Ej. 24"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-400 text-slate-950 border border-amber-500/25 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer mt-2"
                      >
                        Registrar Ficha
                      </button>
                    </form>
                  </div>

                  {/* Anthropometric Logs History */}
                  <div className="glass-card p-6 border border-white/5 rounded-3xl">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4">Historial de Composición</h3>
                    <div className="space-y-4">
                      {selectedPatient.history && selectedPatient.history.length > 0 ? (
                        selectedPatient.history.map((h, i) => (
                          <div key={i} className="border-b border-white/5 pb-3 last:border-0 last:pb-0">
                            <p className="text-[10px] text-amber-400 font-bold">{h.date}</p>
                            <div className="grid grid-cols-4 gap-1.5 mt-1.5 text-slate-300 font-semibold text-[9px] text-center">
                              <div>
                                <p className="text-slate-500 text-[7px] uppercase font-bold">Peso</p>
                                <p>{h.weight} kg</p>
                              </div>
                              <div>
                                <p className="text-slate-500 text-[7px] uppercase font-bold">Grasa</p>
                                <p>{h.bodyFat}%</p>
                              </div>
                              <div>
                                <p className="text-slate-500 text-[7px] uppercase font-bold">Músculo</p>
                                <p>{h.musclePercentage}%</p>
                              </div>
                              <div>
                                <p className="text-slate-500 text-[7px] uppercase font-bold">Visceral</p>
                                <p>Nivel {h.visceralFat}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-text-secondary italic">No se registran evaluaciones.</p>
                      )}
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
        <div className="fixed bottom-6 right-6 z-50 bg-amber-500 text-slate-950 px-4 py-2.5 rounded-2xl font-black uppercase text-[10px] tracking-wider shadow-lg shadow-amber-500/20 animate-bounce">
          ✓ {toastMessage}
        </div>
      )}
    </div>
  );
};
