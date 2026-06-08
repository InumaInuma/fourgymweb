import React from 'react';
import type { GymClass } from '../../domain/entities';

interface ClassCardProps {
  gymClass: GymClass;
  isSelected: boolean;
  onSelect: () => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({ gymClass, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`relative overflow-hidden cursor-pointer rounded-2xl transition-all duration-300 flex flex-col h-full select-none ${
        isSelected
          ? 'bg-slate-900 border-2 border-brand-green shadow-xl shadow-brand-green/10 scale-[1.01]'
          : 'bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 hover:scale-[1.01]'
      }`}
    >
      {/* Aspect Ratio Box for Image */}
      <div className="relative h-44 w-full overflow-hidden">
        <img
          src={gymClass.image}
          alt={gymClass.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent"></div>

        {/* Rating Badge */}
        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 flex items-center space-x-1">
          <svg className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-xs font-black text-white">{gymClass.rating.toFixed(1)}</span>
        </div>

        {/* Selected Accent Tag */}
        {isSelected && (
          <div className="absolute top-3 right-3 bg-brand-green text-primary-dark font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider">
            Activo
          </div>
        )}
      </div>

      {/* Info Content */}
      <div className="p-4 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-black text-white group-hover:text-brand-green tracking-tight leading-tight">
            {gymClass.title}
          </h3>
          <p className="text-xs text-brand-green-strong mt-0.5">Instructor: {gymClass.instructor}</p>
        </div>

        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-text-secondary">
          <div className="flex items-center space-x-1">
            <svg className="w-3.5 h-3.5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-slate-300">{gymClass.time}</span>
          </div>

          <div className="font-black text-white bg-white/5 px-2 py-1 rounded border border-white/5">
            S/ {gymClass.price.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};
