import React from 'react';
import type { ClassSpot } from '../../domain/entities';

interface SeatMapProps {
  seats: ClassSpot[];
  selectedSeat: number | null;
  onSeatSelect: (seatId: number) => void;
}

export const SeatMap: React.FC<SeatMapProps> = ({ seats, selectedSeat, onSeatSelect }) => {

  const getSeatClasses = (status: number, isSelected: boolean) => {
    if (isSelected) {
      // Selected: bright cyan with premium neon glow
      return 'bg-accent-cyan text-slate-950 font-black border border-cyan-300 shadow-lg shadow-accent-cyan/35 scale-105 cursor-pointer';
    }
    switch (status) {
      case 1:
        // Occupied: premium solid pink matching the dashboard theme
        return 'bg-accent-pink text-white border border-accent-pink/40 shadow-md shadow-accent-pink/25 cursor-not-allowed';
      default:
        // Free: premium clean white hexagon/octagon
        return 'bg-white text-slate-950 font-black hover:bg-slate-100 hover:scale-105 hover:shadow-[0_0_12px_rgba(255,255,255,0.25)] transition-all cursor-pointer';
    }
  };

  const renderSeatContent = (seat: ClassSpot, isSelected: boolean) => {
    if (isSelected) {
      return <span className="font-black text-slate-950 text-xs md:text-sm">{seat.id + 1}</span>;
    }
    
    if (seat.status === 1) {
      // Occupied: show seat number and first name in clean high-contrast sans-serif
      const displayName = seat.occupantName
        ? seat.occupantName.split(' ')[0]
        : `Socio ${seat.id + 1}`;

      return (
        <div className="flex flex-col items-center justify-center h-full w-full relative leading-none px-1 py-0.5">
          <span className="text-[9px] text-white/50 font-bold select-none mb-0.5">
            {seat.id + 1}
          </span>
          <span className="text-[10px] text-white font-black tracking-tight select-none uppercase truncate max-w-full">
            {displayName}
          </span>
        </div>
      );
    }

    // Free: show printed seat number in dark slate
    return <span className="select-none font-black text-xs md:text-sm">{seat.id + 1}</span>;
  };

  // Helper to render a specific seat by ID
  const renderSeat = (seatId: number) => {
    const seat = seats.find((s) => s.id === seatId);
    if (!seat) {
      return <div className="w-11 h-11 md:w-13 md:h-13 flex-shrink-0 invisible" />;
    }

    const isSeatSelected = selectedSeat === seat.id;

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
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
        }}
        className={`w-11 h-11 md:w-13 md:h-13 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${getSeatClasses(
          seat.status,
          isSeatSelected
        )}`}
      >
        {renderSeatContent(seat, isSeatSelected)}
      </button>
    );
  };

  return (
    <div className="w-full flex flex-col items-center py-8 px-6 rounded-3xl bg-[#141226]/60 backdrop-blur-md border border-white/10 relative shadow-2xl overflow-hidden shadow-accent-cyan/5">
      
      {/* Mobile Swipe indicator */}
      <div className="text-[10px] text-slate-400 text-center mb-4 animate-pulse flex items-center justify-center gap-1.5 md:hidden font-bold">
        <span>↔ Desliza horizontalmente para ver el salón completo</span>
      </div>

      {/* Grid container with horizontal scroll wrapper for responsive cellphones */}
      <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        <div className="min-w-[720px] px-4 py-2 flex flex-col gap-y-5 select-none">
          
          {/* TOP SECTION: Row 1 & Row 2 containing TARIMA */}
          <div className="flex items-center justify-between w-full gap-x-4">
            
            {/* Left Column (Seats 1-3 and 8-10) */}
            <div className="flex flex-col gap-y-4 flex-1 items-end pr-2">
              {/* Row 1 Left */}
              <div className="flex gap-2.5">
                {renderSeat(0)}
                {renderSeat(1)}
                {renderSeat(2)}
              </div>
              {/* Row 2 Left */}
              <div className="flex gap-2.5 mr-3">
                {renderSeat(7)}
                {renderSeat(8)}
                {renderSeat(9)}
              </div>
            </div>

            {/* Center: TARIMA stage block */}
            <div className="w-48 flex-shrink-0 h-[104px] bg-[#181630] border border-white/10 rounded-[24px] flex items-center justify-center text-white font-black text-xs shadow-md tracking-widest select-none hover:border-brand-green/30 transition-colors">
              <span>TARIMA</span>
            </div>

            {/* Right Column (Seats 4-7 and 11-14) */}
            <div className="flex flex-col gap-y-4 flex-1 items-start pl-2">
              {/* Row 1 Right */}
              <div className="flex gap-2.5">
                {renderSeat(3)}
                {renderSeat(4)}
                {renderSeat(5)}
                {renderSeat(6)}
              </div>
              {/* Row 2 Right */}
              <div className="flex gap-2.5 ml-3">
                {renderSeat(10)}
                {renderSeat(11)}
                {renderSeat(12)}
                {renderSeat(13)}
              </div>
            </div>

          </div>

          {/* MIDDLE SECTION: Rows 3, 4, 5 (Full width rows) */}
          <div className="flex flex-col gap-y-4 w-full items-center py-1">
            {/* Row 3 (Seats 15-24) */}
            <div className="flex gap-2.5 justify-center w-full">
              {renderSeat(14)}
              {renderSeat(15)}
              {renderSeat(16)}
              {renderSeat(17)}
              {renderSeat(18)}
              {renderSeat(19)}
              {renderSeat(20)}
              {renderSeat(21)}
              {renderSeat(22)}
              {renderSeat(23)}
            </div>

            {/* Row 4 (Seats 25-33) - Centers naturally to stagger */}
            <div className="flex gap-2.5 justify-center w-full">
              {renderSeat(24)}
              {renderSeat(25)}
              {renderSeat(26)}
              {renderSeat(27)}
              {renderSeat(28)}
              {renderSeat(29)}
              {renderSeat(30)}
              {renderSeat(31)}
              {renderSeat(32)}
            </div>

            {/* Row 5 (Seats 34-43) */}
            <div className="flex gap-2.5 justify-center w-full">
              {renderSeat(33)}
              {renderSeat(34)}
              {renderSeat(35)}
              {renderSeat(36)}
              {renderSeat(37)}
              {renderSeat(38)}
              {renderSeat(39)}
              {renderSeat(40)}
              {renderSeat(41)}
              {renderSeat(42)}
            </div>
          </div>

          {/* BOTTOM SECTION: Row 6 & Row 7 containing ESCALERA */}
          <div className="flex items-center justify-between w-full gap-x-4">
            
            {/* Left Column (Seats 44-45 and 51-53) */}
            <div className="flex flex-col gap-y-4 flex-1 items-end pr-2">
              {/* Row 6 Left */}
              <div className="flex gap-2.5 mr-6">
                {renderSeat(43)}
                {renderSeat(44)}
              </div>
              {/* Row 7 Left */}
              <div className="flex gap-2.5">
                {renderSeat(50)}
                {renderSeat(51)}
                {renderSeat(52)}
              </div>
            </div>

            {/* Center: ESCALERA block */}
            <div className="w-36 flex-shrink-0 h-[104px] bg-[#181630] border border-white/10 rounded-[24px] flex items-center justify-center text-white/70 font-black text-xs shadow-md tracking-wider select-none text-center hover:border-brand-green/30 transition-colors">
              <span>ESCALERA</span>
            </div>

            {/* Right Column (Seats 46-50 and 54-58) */}
            <div className="flex flex-col gap-y-4 flex-1 items-start pl-2">
              {/* Row 6 Right */}
              <div className="flex gap-2.5">
                {renderSeat(45)}
                {renderSeat(46)}
                {renderSeat(47)}
                {renderSeat(48)}
                {renderSeat(49)}
              </div>
              {/* Row 7 Right */}
              <div className="flex gap-2.5 ml-3">
                {renderSeat(53)}
                {renderSeat(54)}
                {renderSeat(55)}
                {renderSeat(56)}
                {renderSeat(57)}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Legend Block */}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-5 border-t border-white/5 w-full text-xs text-slate-300 font-bold">
        <div className="flex items-center space-x-2">
          <span 
            className="w-4 h-4 bg-white inline-block"
            style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}
          ></span>
          <span>Libre / Disponible</span>
        </div>
        <div className="flex items-center space-x-2">
          <span 
            className="w-4 h-4 bg-accent-pink inline-block border border-accent-pink/40 shadow shadow-accent-pink/20"
            style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}
          ></span>
          <span>Ocupado</span>
        </div>
        <div className="flex items-center space-x-2">
          <span 
            className="w-4 h-4 bg-accent-cyan inline-block border border-cyan-300 shadow shadow-accent-cyan/15"
            style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}
          ></span>
          <span>Seleccionado</span>
        </div>
      </div>


    </div>
  );
};
