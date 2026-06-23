import React from 'react';
import type { Reservation } from '../../../domain/entities';

interface SeatDetailsPanelProps {
  selectedSeatId: number | null;
  associatedReservation: Reservation | null;
  onToggleAttendance: (resId: string) => void;
}

export const SeatDetailsPanel: React.FC<SeatDetailsPanelProps> = ({
  selectedSeatId,
  associatedReservation,
  onToggleAttendance,
}) => {
  return (
    <div className="xl:col-span-1 glass-card flex flex-col justify-between min-h-[350px]">
      {selectedSeatId === null ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
          <span className="text-4xl">👥</span>
          <h3 className="text-sm font-bold text-white">Ningún Lugar Seleccionado</h3>
          <p className="text-xs text-text-secondary">
            Haz clic en un asiento de la grilla para validar el ingreso de un socio o realizar check-in.
          </p>
        </div>
      ) : (
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-brand-green uppercase">Detalle del Lugar</span>
              <span className="text-sm font-black text-white bg-white/10 px-2.5 py-0.5 rounded-lg">
                #{selectedSeatId + 1}
              </span>
            </div>

            {associatedReservation ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-text-secondary uppercase font-semibold">Socio Registrado</span>
                  <p className="text-sm font-black text-white mt-0.5 uppercase">{associatedReservation.userName}</p>
                  <p className="text-xs text-slate-300">{associatedReservation.userEmail}</p>
                </div>

                <div>
                  <span className="text-[10px] text-text-secondary uppercase font-semibold">Hora de Reserva</span>
                  <p className="text-xs text-slate-200 mt-0.5">
                    {new Date(associatedReservation.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      associatedReservation.attended ? 'bg-emerald-500 animate-ping' : 'bg-accent-pink'
                    }`}
                  ></span>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${
                      associatedReservation.attended ? 'text-emerald-400' : 'text-accent-pink'
                    }`}
                  >
                    {associatedReservation.attended ? 'Asistencia Validada (Presente)' : 'Ausente (Pendiente)'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4 text-center">
                <p className="text-xs text-brand-green font-bold">¡Lugar Libre!</p>
                <p className="text-xs text-text-secondary">Nadie ha reservado este asiento para esta sesión todavía.</p>
              </div>
            )}
          </div>

          {associatedReservation && (
            <button
              onClick={() => onToggleAttendance(associatedReservation.id)}
              className={`w-full py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all mt-6 cursor-pointer ${
                associatedReservation.attended
                  ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md shadow-emerald-500/10'
              }`}
            >
              {associatedReservation.attended ? 'Marcar como Ausente' : 'Validar Ingreso (Check-In)'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
