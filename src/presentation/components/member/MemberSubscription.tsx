import React, { useState, useEffect } from 'react';
import { apiService, type SocioConMembresia, type Asistencia } from '../../../data/apiService';

interface MemberSubscriptionProps {
  idSocio: number;
}

export const MemberSubscription: React.FC<MemberSubscriptionProps> = ({ idSocio }) => {
  const [status, setStatus] = useState<SocioConMembresia | null>(null);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const st = await apiService.getSocioStatusSuscripcion(idSocio);
        setStatus(st);
        const asis = await apiService.getSocioAsistencias(idSocio);
        setAsistencias(asis);
      } catch (err: any) {
        setError(err.message || 'Error al cargar información de suscripción.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [idSocio]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-brand-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center text-xs text-rose-400">
        {error || 'No se encontró información de membresía activa.'}
      </div>
    );
  }

  // Calculate remaining days
  let daysRemaining = 0;
  if (status.fechaFinMembresia) {
    const fin = new Date(status.fechaFinMembresia);
    const today = new Date();
    const diff = fin.getTime() - today.getTime();
    daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  return (
    <div className="space-y-6">
      
      {/* Plan Header Card */}
      <div className="glass-panel border border-white/5 rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br from-[#1b1c36] to-[#110f22]">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-brand-green/10 to-transparent pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <span className="text-[10px] font-black uppercase bg-brand-green/10 text-brand-green px-3 py-1 rounded-full border border-brand-green/20">
              Suscripción Activa
            </span>
            <h2 className="text-2xl font-black text-white mt-3 tracking-tight">
              {status.nombrePlan || 'Plan Musculación Mensual'}
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary mt-1 font-semibold">
              <span>Inicio: {status.fechaInicioMembresia ? new Date(status.fechaInicioMembresia).toLocaleDateString() : 'N/A'}</span>
              <span>•</span>
              <span>Vencimiento: {status.fechaFinMembresia ? new Date(status.fechaFinMembresia).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/40 border border-white/5 rounded-2xl p-4 shrink-0">
            <div className="w-12 h-12 rounded-full bg-brand-green/15 flex items-center justify-center text-xl text-brand-green font-bold font-mono">
              {daysRemaining}
            </div>
            <div>
              <p className="text-[10px] text-text-secondary font-black uppercase tracking-wider">Días restantes</p>
              <p className="text-xs font-bold text-white mt-0.5">Vence en {daysRemaining} días</p>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance History Section */}
      <div className="glass-panel border border-white/5 rounded-3xl p-6 space-y-4">
        <div>
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-1 h-3.5 bg-brand-green rounded-full"></span>
            Historial de Asistencias (Check-ins)
          </h3>
          <p className="text-[11px] text-text-secondary mt-0.5">Control de ingresos y asistencia registrado en las sedes.</p>
        </div>

        {asistencias.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-secondary">
            No tienes ingresos registrados en este ciclo. ¡Escanéa tu código QR al ingresar!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[10px] text-text-secondary font-black uppercase tracking-wider">
                  <th className="py-2.5">Fecha</th>
                  <th className="py-2.5">Hora</th>
                  <th className="py-2.5">Sucursal</th>
                  <th className="py-2.5 text-right">Método</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-semibold text-slate-300">
                {asistencias.map((asis) => {
                  const date = new Date(asis.fechaHora);
                  return (
                    <tr key={asis.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 font-mono">{date.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td className="py-3 font-mono text-white">
                        {date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </td>
                      <td className="py-3">{asis.nombreSucursal || 'San Miguel'}</td>
                      <td className="py-3 text-right">
                        <span className="bg-white/5 text-slate-400 px-2 py-0.5 rounded border border-white/10 text-[10px]">
                          {asis.metodoIngreso || 'QR'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
