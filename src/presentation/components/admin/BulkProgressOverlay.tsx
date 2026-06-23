import React from 'react';

interface BulkProgressOverlayProps {
  current: number;
  total: number;
}

export const BulkProgressOverlay: React.FC<BulkProgressOverlayProps> = ({ current, total }) => {
  const percent = Math.round((current / total) * 100) || 0;

  return (
    <div className="absolute inset-0 bg-[#0c0a1a]/95 backdrop-blur-md flex flex-col items-center justify-center p-8 z-50 rounded-3xl border border-white/10">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 border-4 border-brand-green/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-brand-green border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-white uppercase tracking-wider">Generando Programación</h3>
          <p className="text-xs text-slate-400">Por favor, espera mientras creamos las clases en la base de datos...</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-brand-green font-black tracking-widest">
            <span>PROGRESO</span>
            <span>{percent}%</span>
          </div>
          <div className="w-full bg-[#263238] rounded-full h-3.5 p-0.5 border border-white/5 shadow-inner">
            <div
              className="bg-gradient-to-r from-brand-green to-emerald-400 h-2.5 rounded-full transition-all duration-300 shadow-md shadow-brand-green/30"
              style={{ width: `${percent}%` }}
            ></div>
          </div>
          <span className="block text-[10px] text-slate-400 font-bold">
            {current} de {total} clases creadas
          </span>
        </div>
      </div>
    </div>
  );
};
