import React from 'react';
import type { ClassSpot, Reservation } from '../../../domain/entities';

interface AttendanceSeatMapProps {
  seats: ClassSpot[];
  selectedSeatId: number | null;
  reservations: Reservation[];
  onSeatClick: (seatId: number) => void;
}

export const AttendanceSeatMap: React.FC<AttendanceSeatMapProps> = ({
  seats,
  selectedSeatId,
  reservations,
  onSeatClick,
}) => {
  const renderAdminSeat = (seatId: number) => {
    const seat = seats.find((s) => s.id === seatId);
    if (!seat) {
      return <div className="w-11 h-11 md:w-13 md:h-13 invisible" />;
    }

    const isSelected = selectedSeatId === seat.id;
    const resDetail = reservations.find((r) => r.seatId - 1 === seat.id);

    let seatStyleClasses = '';
    let contentElement: React.ReactNode = null;

    if (isSelected) {
      // Selected: Premium Cyan glow, cyan background
      seatStyleClasses = 'bg-accent-cyan text-slate-950 font-black border border-cyan-300 shadow-lg shadow-accent-cyan/35 scale-105 cursor-pointer';
      contentElement = <span className="font-black text-xs md:text-sm">{seat.id + 1}</span>;
    } else if (resDetail) {
      const displayName = resDetail.userName
        ? resDetail.userName.split(' ')[0]
        : `Socio ${seat.id + 1}`;

      if (resDetail.attended) {
        // Checked-In: emerald green background with black text/checkmark
        seatStyleClasses = 'bg-emerald-500 text-slate-950 border border-emerald-300 shadow-lg shadow-emerald-500/30 scale-105 cursor-pointer font-black';
        contentElement = (
          <div className="flex flex-col items-center justify-center h-full w-full relative leading-none px-1 py-0.5">
            <span className="text-[9px] text-slate-950/70 font-bold select-none mb-0.5">✓ {seat.id + 1}</span>
            <span className="text-[10px] text-slate-950 font-black tracking-tight select-none uppercase truncate max-w-full">
              {displayName}
            </span>
          </div>
        );
      } else {
        // Pending Check-in: occupied pink background with white text
        seatStyleClasses = 'bg-accent-pink text-white border border-accent-pink/40 shadow-md shadow-accent-pink/25 cursor-pointer';
        contentElement = (
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
    } else {
      // Free: standard blueprint octagon (white background, dark text)
      seatStyleClasses = 'bg-white text-slate-950 font-black hover:bg-slate-100 hover:scale-105 hover:shadow-[0_0_12px_rgba(255,255,255,0.25)] transition-all cursor-pointer';
      contentElement = <span className="font-bold text-xs md:text-sm select-none">{seat.id + 1}</span>;
    }

    return (
      <button
        key={seat.id}
        onClick={() => onSeatClick(seat.id)}
        style={{
          clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
        }}
        className={`w-11 h-11 md:w-13 md:h-13 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${seatStyleClasses}`}
      >
        {contentElement}
      </button>
    );
  };

  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
      <div className="min-w-[720px] px-4 py-2 flex flex-col gap-y-5 select-none">
        
        {/* TOP SECTION: Row 1 & Row 2 containing TARIMA */}
        <div className="flex items-center justify-between w-full gap-x-4">
          
          {/* Left Column (Seats 1-3 and 8-10) */}
          <div className="flex flex-col gap-y-4 flex-1 items-end pr-2">
            {/* Row 1 Left */}
            <div className="flex gap-2.5">
              {renderAdminSeat(0)}
              {renderAdminSeat(1)}
              {renderAdminSeat(2)}
            </div>
            {/* Row 2 Left */}
            <div className="flex gap-2.5 mr-3">
              {renderAdminSeat(7)}
              {renderAdminSeat(8)}
              {renderAdminSeat(9)}
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
              {renderAdminSeat(3)}
              {renderAdminSeat(4)}
              {renderAdminSeat(5)}
              {renderAdminSeat(6)}
            </div>
            {/* Row 2 Right */}
            <div className="flex gap-2.5 ml-3">
              {renderAdminSeat(10)}
              {renderAdminSeat(11)}
              {renderAdminSeat(12)}
              {renderAdminSeat(13)}
            </div>
          </div>

        </div>

        {/* MIDDLE SECTION: Rows 3, 4, 5 (Full width rows) */}
        <div className="flex flex-col gap-y-4 w-full items-center py-1">
          {/* Row 3 (Seats 15-24) */}
          <div className="flex gap-2.5 justify-center w-full">
            {renderAdminSeat(14)}
            {renderAdminSeat(15)}
            {renderAdminSeat(16)}
            {renderAdminSeat(17)}
            {renderAdminSeat(18)}
            {renderAdminSeat(19)}
            {renderAdminSeat(20)}
            {renderAdminSeat(21)}
            {renderAdminSeat(22)}
            {renderAdminSeat(23)}
          </div>

          {/* Row 4 (Seats 25-33) - Centers naturally to stagger */}
          <div className="flex gap-2.5 justify-center w-full">
            {renderAdminSeat(24)}
            {renderAdminSeat(25)}
            {renderAdminSeat(26)}
            {renderAdminSeat(27)}
            {renderAdminSeat(28)}
            {renderAdminSeat(29)}
            {renderAdminSeat(30)}
            {renderAdminSeat(31)}
            {renderAdminSeat(32)}
          </div>

          {/* Row 5 (Seats 34-43) */}
          <div className="flex gap-2.5 justify-center w-full">
            {renderAdminSeat(33)}
            {renderAdminSeat(34)}
            {renderAdminSeat(35)}
            {renderAdminSeat(36)}
            {renderAdminSeat(37)}
            {renderAdminSeat(38)}
            {renderAdminSeat(39)}
            {renderAdminSeat(40)}
            {renderAdminSeat(41)}
            {renderAdminSeat(42)}
          </div>
        </div>

        {/* BOTTOM SECTION: Row 6 & Row 7 containing ESCALERA */}
        <div className="flex items-center justify-between w-full gap-x-4">
          
          {/* Left Column (Seats 44-45 and 51-53) */}
          <div className="flex flex-col gap-y-4 flex-1 items-end pr-2">
            {/* Row 6 Left */}
            <div className="flex gap-2.5 mr-6">
              {renderAdminSeat(43)}
              {renderAdminSeat(44)}
            </div>
            {/* Row 7 Left */}
            <div className="flex gap-2.5">
              {renderAdminSeat(50)}
              {renderAdminSeat(51)}
              {renderAdminSeat(52)}
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
              {renderAdminSeat(45)}
              {renderAdminSeat(46)}
              {renderAdminSeat(47)}
              {renderAdminSeat(48)}
              {renderAdminSeat(49)}
            </div>
            {/* Row 7 Right */}
            <div className="flex gap-2.5 ml-3">
              {renderAdminSeat(53)}
              {renderAdminSeat(54)}
              {renderAdminSeat(55)}
              {renderAdminSeat(56)}
              {renderAdminSeat(57)}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
