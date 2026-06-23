import React from 'react';

interface NotificationItem {
  idNotificacionUsuario: number;
  idNotificacion: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  leida: boolean;
  fechaLectura: string | null;
  fechaEnvio: string;
}

interface MemberNotificationsProps {
  notifications: NotificationItem[];
  onMarkAsRead: (idNotificacionUsuario: number) => void;
}

export const MemberNotifications: React.FC<MemberNotificationsProps> = ({
  notifications,
  onMarkAsRead,
}) => {
  
  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('es-PE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="glass-card relative overflow-hidden w-full text-slate-300">
      <div className="border-b border-white/5 pb-4 mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="w-1.5 h-6 bg-accent-cyan rounded-full"></span>
          Notificaciones y Novedades
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Mantente al tanto de las últimas promociones, alertas y avisos del gimnasio. Haz clic en una notificación nueva para marcarla como leída.
        </p>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No tienes notificaciones registradas por el momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notifications.map((n) => {
              let icon = 'ℹ️';
              let badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
              if (n.tipo === 'Promocion') {
                icon = '🏷️';
                badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
              } else if (n.tipo === 'Alerta') {
                icon = '⚠️';
                badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
              }

              return (
                <div
                  key={n.idNotificacionUsuario}
                  onClick={() => !n.leida && onMarkAsRead(n.idNotificacionUsuario)}
                  className={`p-5 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                    n.leida
                      ? 'bg-slate-900/40 border-white/5 opacity-65 cursor-default hover:bg-slate-900/60'
                      : 'bg-white/5 border-white/10 hover:border-accent-cyan/30 cursor-pointer shadow-lg hover:bg-white/10'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm font-black text-white flex items-center gap-2">
                        <span className="text-lg">{icon}</span> {n.titulo}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${badgeColor}`}>
                          {n.tipo}
                        </span>
                        {!n.leida && (
                          <span className="w-2 h-2 bg-accent-cyan rounded-full shrink-0 animate-pulse"></span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                      {n.mensaje}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-text-secondary font-bold">
                    <span>Enviado: {formatDateTime(n.fechaEnvio)}</span>
                    {n.leida && n.fechaLectura && (
                      <span className="text-slate-400">Leído: {formatDateTime(n.fechaLectura)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
