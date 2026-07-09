import React, { useState, useEffect } from 'react';
import { apiService, type Cita, type Colaborador } from '../../../data/apiService';

interface MemberAppointmentsProps {
  idSocio: number;
}

export const MemberAppointments: React.FC<MemberAppointmentsProps> = ({ idSocio }) => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [especialistas, setEspecialistas] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [tipoCita, setTipoCita] = useState<'Nutricion' | 'Entrenamiento'>('Nutricion');
  const [idEspecialista, setIdEspecialista] = useState<number>(0);
  const [fechaCita, setFechaCita] = useState('');
  const [horaCita, setHoraCita] = useState('09:00');
  const [notas, setNotas] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const list = await apiService.getSocioCitas(idSocio);
      setCitas(list);
      const esp = await apiService.getEspecialistas();
      setEspecialistas(esp);
    } catch (err: any) {
      setError(err.message || 'Error al cargar citas de evaluación.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [idSocio]);

  // Handle cancel appointment
  const handleCancel = async (idCita: number) => {
    if (!window.confirm('¿Está seguro de que desea cancelar esta cita?')) return;
    try {
      setLoading(true);
      await apiService.cancelarCita(idCita);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al cancelar la cita.');
      setLoading(false);
    }
  };

  // Filter specialists based on selected appointment type
  const filteredEspecialistas = especialistas.filter(e => {
    if (tipoCita === 'Nutricion') return e.idRol === 5; // Nutritionists
    return e.idRol === 4; // Trainers
  });

  // Handle booking form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idEspecialista) {
      alert('Por favor seleccione un especialista.');
      return;
    }
    if (!fechaCita) {
      alert('Por favor seleccione una fecha.');
      return;
    }

    try {
      setFormLoading(true);
      const datetimeStr = `${fechaCita}T${horaCita}:00`;
      await apiService.agendarCita({
        idSocio,
        idEspecialista,
        fechaHora: datetimeStr,
        tipoCita,
        notas: notas || undefined,
      });

      setFormSuccess('🎉 Cita reservada correctamente.');
      setNotas('');
      setTimeout(() => {
        setShowBookingForm(false);
        setFormSuccess('');
        loadData();
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Error al agendar cita de evaluación.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Booking CTA */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-1.5 h-6 bg-brand-green rounded-full"></span>
            Citas de Evaluación
          </h2>
          <p className="text-xs text-text-secondary mt-1">Programa y consulta tus visitas de control antropométrico y rutinas.</p>
        </div>

        {!showBookingForm && (
          <button
            onClick={() => {
              setShowBookingForm(true);
              if (filteredEspecialistas.length > 0) {
                setIdEspecialista(filteredEspecialistas[0].idUsuario);
              }
            }}
            className="px-4 py-2 bg-brand-green hover:bg-brand-green-strong text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-brand-green/5"
          >
            🗓️ Agendar Nueva Cita
          </button>
        )}
      </div>

      {/* Booking Form Card */}
      {showBookingForm && (
        <div className="glass-panel border border-white/10 rounded-3xl p-6 bg-gradient-to-br from-[#141226]/80 to-[#0c0a1a]/95 space-y-4">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <h3 className="text-sm font-black text-white uppercase tracking-tight">Nueva Cita de Control</h3>
            <button
              onClick={() => setShowBookingForm(false)}
              className="text-slate-400 hover:text-white cursor-pointer text-xs"
            >
              ✕ Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Type */}
              <div>
                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1.5">Especialidad</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setTipoCita('Nutricion'); setIdEspecialista(0); }}
                    className={`flex-grow py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                      tipoCita === 'Nutricion' ? 'bg-brand-green text-slate-950 font-black' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    🍎 Nutrición
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTipoCita('Entrenamiento'); setIdEspecialista(0); }}
                    className={`flex-grow py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                      tipoCita === 'Entrenamiento' ? 'bg-brand-green text-slate-950 font-black' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    💪 Entrenamiento
                  </button>
                </div>
              </div>

              {/* Specialist */}
              <div>
                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1.5">Seleccionar Especialista</label>
                <select
                  value={idEspecialista}
                  onChange={(e) => setIdEspecialista(parseInt(e.target.value, 10))}
                  required
                  className="w-full bg-[#1b1c36] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none"
                  style={{ background: '#1b1c36', color: '#fff' }}
                >
                  <option value={0}>Selecciona un especialista...</option>
                  {filteredEspecialistas.map((esp) => (
                    <option key={esp.idUsuario} value={esp.idUsuario}>
                      {esp.nombre} {esp.apellidoPaterno} ({esp.nombreRol})
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Date */}
              <div>
                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1.5">Fecha de Cita</label>
                <input
                  type="date"
                  required
                  value={fechaCita}
                  onChange={(e) => setFechaCita(e.target.value)}
                  min={new Date().toLocaleDateString('sv-SE')}
                  className="w-full bg-[#1b1c36] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                />
              </div>

              {/* Time */}
              <div>
                <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1.5">Hora</label>
                <select
                  value={horaCita}
                  onChange={(e) => setHoraCita(e.target.value)}
                  className="w-full bg-[#1b1c36] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none font-mono"
                  style={{ background: '#1b1c36', color: '#fff' }}
                >
                  <option value="08:00">08:00 a.m.</option>
                  <option value="09:00">09:00 a.m.</option>
                  <option value="10:00">10:00 a.m.</option>
                  <option value="11:00">11:00 a.m.</option>
                  <option value="15:00">03:00 p.m.</option>
                  <option value="16:00">04:00 p.m.</option>
                  <option value="17:00">05:00 p.m.</option>
                  <option value="18:00">06:00 p.m.</option>
                </select>
              </div>

            </div>

            <div>
              <label className="block text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1.5">Notas / Objetivo de consulta</label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Indica si tienes alguna consulta especial o cambio físico reciente..."
                rows={2}
                className="w-full bg-[#1b1c36] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            {formSuccess && <p className="text-xs text-emerald-400 font-bold font-mono">{formSuccess}</p>}

            <button
              type="submit"
              disabled={formLoading}
              className="w-full py-2.5 bg-brand-green hover:bg-brand-green-strong text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              {formLoading ? 'Reservando...' : 'Confirmar Reserva de Cita'}
            </button>

          </form>
        </div>
      )}

      {/* Appointments List */}
      <div className="glass-panel border border-white/5 rounded-3xl p-6 space-y-4">
        <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
          <span className="w-1 h-3.5 bg-brand-green rounded-full"></span>
          Mis Citas Programadas
        </h3>

        {loading ? (
          <div className="text-center py-8 text-xs text-text-secondary">Cargando citas...</div>
        ) : citas.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-secondary">
            No tienes citas de control programadas. Agenda una evaluación antropométrica o de entrenamiento hoy.
          </div>
        ) : (
          <div className="divide-y divide-white/5 space-y-4">
            {citas.map((cita) => {
              const date = new Date(cita.fechaHora);
              const dateStr = date.toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
              const timeStr = date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true });
              const isUpcoming = date.getTime() > Date.now() && cita.estado === 'Programada';

              return (
                <div key={cita.id} className="pt-4 first:pt-0 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs font-semibold">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-base shrink-0">
                      {cita.tipoCita === 'Nutricion' ? '🍎' : '💪'}
                    </div>
                    <div>
                      <p className="font-bold text-white text-sm">
                        Cita de {cita.tipoCita === 'Nutricion' ? 'Nutrición' : 'Evaluación Física'}
                      </p>
                      <p className="text-text-secondary mt-0.5">Especialista: {cita.nombreEspecialista}</p>
                      <p className="text-slate-400 font-mono mt-1 text-[10px] uppercase">
                        {dateStr} a las {timeStr}
                      </p>
                      {cita.notas && (
                        <p className="text-[10px] italic text-text-secondary mt-1 bg-white/5 p-2 rounded-lg border border-white/5 max-w-sm">
                          "{cita.notas}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                      cita.estado === 'Programada'
                        ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                        : cita.estado === 'Realizada'
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                        : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                    }`}>
                      {cita.estado}
                    </span>

                    {isUpcoming && (
                      <button
                        onClick={() => handleCancel(cita.id)}
                        className="text-rose-400 hover:text-rose-500 text-[10px] font-black uppercase tracking-wider cursor-pointer"
                      >
                        Cancelar
                      </button>
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
