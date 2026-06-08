import React from 'react';
import type { Promo } from '../../domain/entities';

interface PromoCarouselProps {
  promos: Promo[];
}

export const PromoCarousel: React.FC<PromoCarouselProps> = ({ promos }) => {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <span className="w-1.5 h-6 bg-brand-green rounded-full"></span>
          Descubre las promos más buscadas
        </h2>
        <span className="text-xs text-text-secondary">Desliza para ver más</span>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {promos.map((promo) => (
          <div
            key={promo.id}
            className="flex-shrink-0 w-80 h-44 snap-start relative rounded-2xl overflow-hidden group cursor-pointer shadow-lg shadow-black/35 hover:scale-[1.02] hover:shadow-brand-green/5 transition-all duration-300 border border-white/5"
          >
            {/* Promo Image */}
            <img
              src={promo.imageUrl}
              alt={promo.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

            {/* Discount Badge */}
            <div className="absolute top-0 right-4 bg-amber-400 text-slate-950 font-extrabold text-xs px-3 py-1.5 rounded-b-xl shadow-md uppercase tracking-wider animate-bounce-slow">
              {promo.discount}
            </div>

            {/* Info overlay */}
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="text-sm font-extrabold text-white group-hover:text-brand-green transition-colors line-clamp-2">
                {promo.title}
              </h3>
              <p className="text-xs text-brand-green/80 mt-1 font-semibold flex items-center gap-1">
                Aprovecha ahora 
                <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
