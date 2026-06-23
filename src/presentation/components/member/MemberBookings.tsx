import React, { useState, useEffect } from 'react';
import type { User } from '../../../domain/entities';
import { apiService } from '../../../data/apiService';

interface MemberBookingsProps {
  user: User;
  onReservationCancelled?: () => void;
}

interface ReservaItem {
  idReserva: number;
  asientoId: number;
  fechaReserva: string;
  asistio: boolean;
  idClase: number;
  tituloClase: string;
  fechaInicioClase: string;
  roomName: string;
  precio: number;
  nombreInstructor: string;
}

export const MemberBookings: React.FC<MemberBookingsProps> = ({ user, onReservationCancelled }) => {
  const [bookings, setBookings] = useState<ReservaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const loadBookings = async () => {
    if (!user.idSocio) return;
    try {
      setLoading(true);
      const data = await apiService.getReservasSocio(user.idSocio);
      setBookings(data);
    } catch (err) {
      console.error('Error loading member bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user.idSocio]);

  const handleCancel = async (idReserva: number) => {
    const confirmCancel = window.confirm('¿Estás seguro de que deseas cancelar esta reserva? Se liberará tu asiento inmediatamente.');
    if (!confirmCancel) return;

    try {
      setCancellingId(idReserva);
      const success = await apiService.cancelarReserva(idReserva, user.name);
      if (success) {
        alert('Reserva cancelada correctamente.');
        await loadBookings();
        if (onReservationCancelled) {
          onReservationCancelled();
        }
      } else {
        alert('No se pudo cancelar la reserva.');
      }
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      alert('Ocurrió un error al intentar cancelar la reserva.');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const dateFormatted = d.toLocaleDateString('es-PE', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
    
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minStr = minutes < 10 ? '0' + minutes : minutes;
    const timeFormatted = `${hours}:${minStr} ${ampm}`;

    return { dateFormatted, timeFormatted };
  };

  return (
    <div className="glass-card relative overflow-hidden w-full text-slate-300">
      <div className="border-b border-white/5 pb-4 mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-1.5 h-6 bg-accent-cyan rounded-full"></span>
          Mis Reservas Agendadas
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Visualiza tu historial de reservas y gestiona tus ubicaciones. Puedes cancelar antes del inicio de la sesión.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 text-xs font-bold">Cargando tus reservas...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-xs">
          Aún no tienes ninguna reserva registrada. ¡Elige una clase en la pestaña de Clases para reservar tu sitio!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/5 text-text-secondary uppercase tracking-widest text-[10px] font-bold">
                <th className="py-3 px-4">Clase / Sesión</th>
                <th className="py-3 px-4">Profesor / Instructor</th>
                <th className="py-3 px-4">Salón / Lugar</th>
                <th className="py-3 px-4">Horario</th>
                <th className="py-3 px-4">Asiento</th>
                <th className="py-3 px-4 font-mono">Precio</th>
                <th className="py-3 px-4">Asistencia</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-semibold">
              {bookings.map((b) => {
                const { dateFormatted, timeFormatted } = formatDateTime(b.fechaInicioClase);
                const classTime = new Date(b.fechaInicioClase);
                const now = new Date();
                const canCancel = classTime.getTime() > now.getTime();

                // Status Badge logic
                let statusBadge = null;
                if (b.asistio) {
                  statusBadge = (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold">
                      Asistió
                    </span>
                  );
                } else if (classTime.getTime() < now.getTime()) {
                  statusBadge = (
                    <span className="bg-slate-800 text-slate-400 border border-white/5 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold">
                      No asistió
                    </span>
                  );
                } else {
                  statusBadge = (
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold">
                      Reservado
                    </span>
                  );
                }

                return (
                  <tr key={b.idReserva} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4 text-white font-bold">{b.tituloClase}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                        {b.nombreInstructor}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="block">{b.roomName}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="block font-bold text-slate-200">{dateFormatted}</span>
                      <span className="text-[10px] text-text-secondary">{timeFormatted}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="bg-slate-900 border border-white/10 px-2.5 py-1 rounded-lg text-white font-mono">
                        #{b.asientoId}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-200">
                      S/ {b.precio.toFixed(2)}
                    </td>
                    <td className="py-4 px-4">{statusBadge}</td>
                    <td className="py-4 px-4 text-right">
                      {canCancel ? (
                        <button
                          disabled={cancellingId === b.idReserva}
                          onClick={() => handleCancel(b.idReserva)}
                          className="px-3 py-1.5 bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white font-bold rounded-lg transition-all text-[10px] uppercase tracking-wider cursor-pointer disabled:opacity-50 active:scale-95"
                        >
                          {cancellingId === b.idReserva ? 'Cancelando...' : 'Cancelar'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                          Pasada
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
