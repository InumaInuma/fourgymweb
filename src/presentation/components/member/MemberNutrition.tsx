import React, { useState, useEffect } from 'react';
import { apiService, type PlanAlimentario, type EvaluacionAntropometrica } from '../../../data/apiService';

interface MemberNutritionProps {
  idSocio: number;
}

export const MemberNutrition: React.FC<MemberNutritionProps> = ({ idSocio }) => {
  const [diet, setDiet] = useState<PlanAlimentario | null>(null);
  const [evaluaciones, setEvaluaciones] = useState<EvaluacionAntropometrica[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState('');

  useEffect(() => {
    const loadNutrition = async () => {
      try {
        setLoading(true);
        const d = await apiService.getSocioPlanAlimentario(idSocio);
        setDiet(d);
        const evals = await apiService.getSocioEvaluacionesAntropometricas(idSocio);
        // Sort by date ascending to draw progress line chart
        const sortedEvals = evals.sort((a, b) => new Date(a.fechaEvaluacion).getTime() - new Date(b.fechaEvaluacion).getTime());
        setEvaluaciones(sortedEvals);
      } catch (err: any) {
        setError(err.message || 'Error al obtener plan alimentario.');
      } finally {
        setLoading(false);
      }
    };
    loadNutrition();
  }, [idSocio]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Draw simple custom line chart inside SVG
  const renderProgressChart = () => {
    if (evaluaciones.length < 2) {
      return (
        <div className="py-8 text-center text-xs text-text-secondary">
          Se requieren al menos 2 evaluaciones para dibujar tu gráfico de progreso. ¡Agenda tu cita de pesaje!
        </div>
      );
    }

    const width = 500;
    const height = 150;
    const padding = 20;

    const weights = evaluaciones.map(e => e.peso);
    const minWeight = Math.min(...weights) - 5;
    const maxWeight = Math.max(...weights) + 5;
    const weightRange = maxWeight - minWeight;

    // Map points to SVG coordinates
    const points = evaluaciones.map((e, index) => {
      const x = padding + (index * (width - 2 * padding)) / (evaluaciones.length - 1);
      const y = height - padding - ((e.peso - minWeight) * (height - 2 * padding)) / weightRange;
      return { x, y, peso: e.peso, fecha: new Date(e.fechaEvaluacion).toLocaleDateString('es-PE', { month: 'short', day: 'numeric' }) };
    });

    // Create polyline string
    const polylinePath = points.map(p => `${p.x},${p.y}`).join(' ');

    return (
      <div className="space-y-4">
        <div className="relative w-full overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
            {/* Background grid lines */}
            <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1={padding} y1={height - padding} x2={width-padding} y2={height - padding} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            
            {/* Progress line path */}
            <polyline
              fill="none"
              stroke="#22c55e"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylinePath}
              className="drop-shadow-[0_2px_8px_rgba(34,197,94,0.3)]"
            />

            {/* Point circles */}
            {points.map((p, idx) => (
              <g key={idx} className="group cursor-pointer">
                <circle cx={p.x} cy={p.y} r="5" fill="#141226" stroke="#22c55e" strokeWidth="2.5" />
                <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#fff" fontSize="9" className="font-mono font-bold">
                  {p.peso} kg
                </text>
                <text x={p.x} y={height - 4} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8">
                  {p.fecha}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Diet Plan / Macro Targets (8 columns on desktop) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Macros Breakdown Card */}
        {diet ? (
          <div className="glass-panel border border-white/5 rounded-3xl p-6 bg-gradient-to-br from-[#1b1c36] to-[#110f22] space-y-4">
            <div>
              <span className="text-[10px] font-black uppercase bg-brand-green/10 text-brand-green px-3 py-1 rounded-full border border-brand-green/20">
                Plan Alimentario Activo
              </span>
              <h2 className="text-lg font-black text-white mt-3 tracking-tight">
                Objetivo Calórico: <span className="text-brand-green font-mono">{diet.caloriasObjetivo} kcal</span> al día
              </h2>
            </div>

            {/* Macros Progress Bar Row */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-[#141226]/50 border border-white/5 p-3 rounded-2xl">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Proteínas</span>
                <span className="text-white font-mono font-black">{diet.porcentajeProteina}%</span>
                <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${diet.porcentajeProteina}%` }}></div>
                </div>
              </div>

              <div className="bg-[#141226]/50 border border-white/5 p-3 rounded-2xl">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Carbohidratos</span>
                <span className="text-white font-mono font-black">{diet.porcentajeCarbohidratos}%</span>
                <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${diet.porcentajeCarbohidratos}%` }}></div>
                </div>
              </div>

              <div className="bg-[#141226]/50 border border-white/5 p-3 rounded-2xl">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Grasas</span>
                <span className="text-white font-mono font-black">{diet.porcentajeGrasa}%</span>
                <div className="w-full bg-white/5 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-rose-400 h-full rounded-full" style={{ width: `${diet.porcentajeGrasa}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-panel border border-white/5 rounded-3xl p-6 text-center text-xs text-text-secondary">
            ⚠️ Aún no tienes un plan alimentario estructurado prescrito por el nutricionista.
          </div>
        )}

        {/* Meals Detail List */}
        {diet && (
          <div className="glass-panel border border-white/5 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-1 h-3.5 bg-brand-green rounded-full"></span>
              Menú de comidas diarias
            </h3>

            <div className="space-y-3 divide-y divide-white/5">
              
              <div className="pt-3 first:pt-0">
                <span className="text-[9px] text-brand-green font-black uppercase tracking-wider">🍳 Desayuno</span>
                <p className="text-xs font-bold text-white mt-1 leading-relaxed">{diet.desayuno}</p>
              </div>

              {diet.colacion1 && (
                <div className="pt-3">
                  <span className="text-[9px] text-amber-400 font-black uppercase tracking-wider">🍏 Colación Mañana</span>
                  <p className="text-xs font-bold text-white mt-1 leading-relaxed">{diet.colacion1}</p>
                </div>
              )}

              <div className="pt-3">
                <span className="text-[9px] text-accent-cyan font-black uppercase tracking-wider">🍲 Almuerzo</span>
                <p className="text-xs font-bold text-white mt-1 leading-relaxed">{diet.almuerzo}</p>
              </div>

              {diet.merienda && (
                <div className="pt-3">
                  <span className="text-[9px] text-purple-400 font-black uppercase tracking-wider">🥪 Merienda / Post-entreno</span>
                  <p className="text-xs font-bold text-white mt-1 leading-relaxed">{diet.merienda}</p>
                </div>
              )}

              <div className="pt-3">
                <span className="text-[9px] text-rose-400 font-black uppercase tracking-wider">🥗 Cena</span>
                <p className="text-xs font-bold text-white mt-1 leading-relaxed">{diet.cena}</p>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Progress & Body Metrics (5 columns on desktop) */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Antropometric line chart */}
        <div className="glass-panel border border-white/5 rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Historial de Peso (kg)</h3>
            <p className="text-[10px] text-text-secondary mt-0.5">Control de peso y evolución antropométrica.</p>
          </div>
          {renderProgressChart()}
        </div>

        {/* Detailed last evaluation metrics cards */}
        {evaluaciones.length > 0 ? (
          <div className="glass-panel border border-white/5 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Última Evaluación Física</h3>
            
            {(() => {
              const last = evaluaciones[evaluaciones.length - 1];
              return (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-white/5 p-3 rounded-2xl text-center">
                    <span className="text-[9px] text-text-secondary uppercase font-bold block">Grasa Corporal</span>
                    <span className="text-lg font-black text-rose-400 font-mono">{last.porcentajeGrasa}%</span>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl text-center">
                    <span className="text-[9px] text-text-secondary uppercase font-bold block">Masa Muscular</span>
                    <span className="text-lg font-black text-emerald-400 font-mono">{last.porcentajeMusculo}%</span>
                  </div>
                  {last.grasaVisceral !== undefined && (
                    <div className="bg-white/5 p-3 rounded-2xl text-center">
                      <span className="text-[9px] text-text-secondary uppercase font-bold block">Grasa Visceral</span>
                      <span className="text-lg font-black text-amber-400 font-mono">{last.grasaVisceral}</span>
                    </div>
                  )}
                  {last.edadMetabolica !== undefined && (
                    <div className="bg-white/5 p-3 rounded-2xl text-center">
                      <span className="text-[9px] text-text-secondary uppercase font-bold block">Edad Metabólica</span>
                      <span className="text-lg font-black text-slate-300 font-mono">{last.edadMetabolica} años</span>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="glass-panel border border-white/5 rounded-3xl p-6 text-center text-xs text-text-secondary">
            No hay registros de mediciones corporales.
          </div>
        )}

      </div>

    </div>
  );
};
