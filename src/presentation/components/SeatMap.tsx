import React from 'react';
import type { ClassSpot } from '../../domain/entities';

interface SeatMapProps {
  seats: ClassSpot[];
  selectedSeat: number | null;
  onSeatSelect: (seatId: number) => void;
}

export const SeatMap: React.FC<SeatMapProps> = ({ seats, selectedSeat, onSeatSelect }) => {
  
  const getSeatColors = (status: number, isSelected: boolean) => {
    if (isSelected) {
      return 'bg-accent-cyan text-slate-950 font-black shadow-lg shadow-accent-cyan/25 hover:scale-105';
    }
    switch (status) {
      case 1:
        return 'bg-accent-pink text-white font-bold cursor-not-allowed opacity-80';
      case 2:
        return 'bg-accent-cyan text-slate-950 font-black shadow-lg shadow-accent-cyan/25 hover:scale-105';
      default:
        return 'bg-white text-slate-900 font-bold hover:bg-slate-200 hover:scale-105 cursor-pointer';
    }
  };

  return (
    <div className="w-full flex flex-col items-center py-6 px-4 rounded-3xl bg-slate-900/50 border border-white/5 relative shadow-inner">
      
      {/* TARIMA (Stage) */}
      <div className="w-48 h-12 bg-slate-950 border border-white/10 rounded-xl flex items-center justify-center shadow-lg mb-8">
        <span className="text-sm font-black text-white/90 tracking-widest uppercase">TARIMA</span>
      </div>

      {/* Grid of Hexagons */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3 max-w-2xl w-full justify-center">
        {seats.map((seat) => {
          const isSeatSelected = selectedSeat === seat.id;
          
          // Custom staircase block inside grid at index 42
          if (seat.id === 42) {
            return (
              <div
                key="stair-block"
                className="aspect-square flex items-center justify-center bg-slate-950 border border-white/10 rounded-lg select-none"
              >
                <span className="text-[10px] font-black text-white/40 tracking-wider">ESC.</span>
              </div>
            );
          }

          return (
            <button
              key={seat.id}
              onClick={() => {
                if (seat.status !== 1) {
                  onSeatSelect(seat.id);
                }
              }}
              disabled={seat.status === 1}
              style={{
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              }}
              className={`aspect-square flex items-center justify-center text-xs transition-all duration-200 ${getSeatColors(
                seat.status,
                isSeatSelected
              )}`}
            >
              <span className="select-none">{seat.id + 1}</span>
            </button>
          );
        })}
      </div>

      {/* ESCALERA (Main Stairs) */}
      <div className="w-56 h-12 bg-slate-950 border border-white/10 rounded-xl flex items-center justify-center shadow-lg mt-8">
        <span className="text-sm font-black text-white/60 tracking-widest uppercase">ESCALERA PRINCIPAL</span>
      </div>

      {/* Legend Block */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-6 border-t border-white/5 w-full text-xs">
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 bg-white rounded-full inline-block"></span>
          <span className="text-text-secondary font-medium">Libre</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 bg-accent-pink rounded-full inline-block"></span>
          <span className="text-text-secondary font-medium">Ocupado</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 bg-accent-cyan rounded-full inline-block"></span>
          <span className="text-text-secondary font-medium">Tuyo / Seleccionado</span>
        </div>
      </div>

    </div>
  );
};
