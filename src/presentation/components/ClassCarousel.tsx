import React from 'react';
import type { GymClass } from '../../domain/entities';

interface ClassCarouselProps {
  classes: GymClass[];
  selectedClassId?: string;
  onSelectClass: (gymClass: GymClass) => void;
}

export const ClassCarousel: React.FC<ClassCarouselProps> = ({
  classes,
  selectedClassId,
  onSelectClass
}) => {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <span className="w-1.5 h-6 bg-brand-green rounded-full animate-pulse"></span>
          Descubre las clases de hoy
        </h2>
        <span className="text-xs text-text-secondary">Desliza para ver más</span>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {classes.map((gymClass) => {
          const isSelected = selectedClassId === gymClass.id;
          const availableSpots = gymClass.spotsTotal - gymClass.spotsReserved;
          
          return (
            <button
              key={gymClass.id}
              onClick={() => onSelectClass(gymClass)}
              className={`flex-shrink-0 text-left w-80 h-44 snap-start relative rounded-2xl overflow-hidden group cursor-pointer shadow-lg shadow-black/35 transition-all duration-300 border ${
                isSelected 
                  ? 'border-brand-green ring-2 ring-brand-green/30 scale-[1.02]' 
                  : 'border-white/5 hover:border-brand-green/40 hover:scale-[1.01]'
              }`}
            >
              {/* Class Image */}
              <img
                src={gymClass.image}
                alt={gymClass.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

              {/* Time Badge */}
              <div className="absolute top-0 right-4 bg-brand-green text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-b-xl shadow-md uppercase tracking-wider">
                {gymClass.time}
              </div>

              {/* Spots Left Badge */}
              <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md text-[10px] text-brand-green border border-brand-green/20 font-bold px-2 py-0.5 rounded-md">
                {availableSpots > 0 ? `${availableSpots} libres` : 'Lleno'}
              </div>

              {/* Info overlay */}
              <div className="absolute bottom-4 left-4 right-4 space-y-1">
                <span className="text-[10px] text-accent-cyan font-bold uppercase tracking-wider">
                  {gymClass.roomName || 'Salón Principal'}
                </span>
                <h3 className="text-sm font-extrabold text-white group-hover:text-brand-green transition-colors line-clamp-1 uppercase">
                  {gymClass.title}
                </h3>
                <p className="text-[11px] text-text-secondary">
                  Instructor: <span className="text-white font-medium">{gymClass.instructor}</span>
                </p>
                <p className="text-xs text-brand-green/90 font-black flex items-center gap-1 pt-1.5 uppercase tracking-wider">
                  Reserva tu sitio
                  <svg className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
