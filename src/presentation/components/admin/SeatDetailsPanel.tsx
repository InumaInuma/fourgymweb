import React, { useState, useEffect } from 'react';
import type { Reservation, GymClass } from '../../../domain/entities';
import { apiService } from '../../../data/apiService';

interface SeatDetailsPanelProps {
  selectedSeatId: number | null;
  associatedReservation: Reservation | null;
  onToggleAttendance: (resId: string) => void;
  selectedClass: GymClass | null;
  onReservationCreated: () => void;
}

export const SeatDetailsPanel: React.FC<SeatDetailsPanelProps> = ({
  selectedSeatId,
  associatedReservation,
  onToggleAttendance,
  selectedClass,
  onReservationCreated,
}) => {
  // Socio selection state
  const [socios, setSocios] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSocio, setSelectedSocio] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Guest registration state
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestLastName, setGuestLastName] = useState('');
  const [guestSecondLastName, setGuestSecondLastName] = useState('');
  const [guestDni, setGuestDni] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  // Fetch socios list when seat detail mounts
  useEffect(() => {
    const loadSocios = async () => {
      try {
        const list = await apiService.getSocios();
        setSocios(list);
      } catch (err) {
        console.error('Error loading socios in seat details panel:', err);
      }
    };
    loadSocios();
  }, []);

  // Reset state when selection changes
  useEffect(() => {
    setSearchQuery('');
    setSelectedSocio(null);
    setShowGuestForm(false);
    setErrorMsg('');
    setSuccessMsg('');
    // Reset guest fields
    setGuestName('');
    setGuestLastName('');
    setGuestSecondLastName('');
    setGuestDni('');
    setGuestPhone('');
    setGuestEmail('');
  }, [selectedSeatId]);

  // Autocomplete filtering for socios
  const filteredSocios = socios.filter((s) => {
    const fullName = `${s.nombre} ${s.apellidoPaterno} ${s.apellidoMaterno}`.toLowerCase();
    const doc = (s.numeroDocumento || '').toString();
    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      doc.includes(searchQuery)
    );
  });

  const handleBookSeat = async () => {
    if (!selectedClass || selectedSeatId === null || !selectedSocio) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await apiService.crearReserva(
        parseInt(selectedClass.id, 10),
        selectedSeatId + 1,
        selectedSocio.idSocio,
        'AdminStaff'
      );

      if (res.success) {
        setSuccessMsg('¡Reserva creada con éxito!');
        setSelectedSocio(null);
        setTimeout(() => {
          onReservationCreated();
        }, 1000);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al crear la reserva.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterGuestAndBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || selectedSeatId === null) return;
    if (!guestName || !guestLastName) {
      setErrorMsg('Nombre y Apellido Paterno son campos obligatorios.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Registrar al invitado
      const guestRes = await apiService.registrarInvitado({
        nombre: guestName,
        apellidoPaterno: guestLastName,
        apellidoMaterno: guestSecondLastName,
        numeroDocumento: guestDni,
        idTipoDocumento: 1, // DNI
        telefono: guestPhone,
        correo: guestEmail,
      });

      if (!guestRes.success || !guestRes.data) {
        setErrorMsg(guestRes.message);
        setLoading(false);
        return;
      }

      const newSocioId = guestRes.data;

      // 2. Reservar el asiento para este nuevo socio invitado
      const res = await apiService.crearReserva(
        parseInt(selectedClass.id, 10),
        selectedSeatId + 1,
        newSocioId,
        'AdminStaff'
      );

      if (res.success) {
        setSuccessMsg('¡Invitado registrado y reserva creada con éxito!');
        setShowGuestForm(false);
        setTimeout(() => {
          onReservationCreated();
        }, 1000);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al completar el registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="xl:col-span-1 glass-card flex flex-col justify-between min-h-[450px]">
      {selectedSeatId === null ? (
        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
          <span className="text-4xl">👥</span>
          <h3 className="text-sm font-bold text-white">Ningún Lugar Seleccionado</h3>
          <p className="text-xs text-text-secondary">
            Haz clic en un asiento de la grilla para validar el ingreso de un socio, ver detalles o realizar reservas.
          </p>
        </div>
      ) : (
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-4">
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
              <div className="space-y-3">
                <div className="text-center py-1">
                  <p className="text-xs text-brand-green font-extrabold uppercase tracking-wide">¡Lugar Libre!</p>
                  <p className="text-[11px] text-text-secondary mt-0.5">Asigna el asiento a continuación:</p>
                </div>

                {errorMsg && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] p-2.5 rounded-lg font-semibold text-center">
                    {errorMsg}
                  </div>
                )}

                {successMsg && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] p-2.5 rounded-lg font-semibold text-center">
                    {successMsg}
                  </div>
                )}

                {!showGuestForm ? (
                  <div className="space-y-3">
                    {/* Search / Auto-complete Selector for Members */}
                    <div className="relative">
                      <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest block mb-1">
                        Buscar Socio
                      </label>
                      <input
                        type="text"
                        placeholder="Nombre, Apellido o DNI..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          if (selectedSocio) setSelectedSocio(null);
                        }}
                        className="w-full bg-[#110e2e] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-green/50"
                      />
                      {searchQuery.length >= 2 && !selectedSocio && (
                        <div className="absolute left-0 right-0 z-30 max-h-48 overflow-y-auto bg-[#1b1931] border border-white/10 rounded-xl shadow-xl mt-1 scrollbar-thin">
                          {filteredSocios.length > 0 ? (
                            filteredSocios.map((s) => (
                              <button
                                key={s.idSocio}
                                type="button"
                                onClick={() => {
                                  setSelectedSocio(s);
                                  setSearchQuery(`${s.nombre} ${s.apellidoPaterno}`);
                                }}
                                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-[#252347] hover:text-white border-b border-white/5 last:border-0"
                              >
                                <span className="font-bold">{s.nombre} {s.apellidoPaterno}</span>
                                <span className="text-[10px] text-text-secondary block mt-0.5">DNI: {s.numeroDocumento || 'S/D'}</span>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-xs text-slate-500 italic text-center">
                              No se encontraron resultados
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowGuestForm(true)}
                      className="w-full py-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 text-xs rounded-xl font-bold uppercase tracking-wider transition-all"
                    >
                      ✨ Registrar como Invitado / Clase Suelta
                    </button>
                  </div>
                ) : (
                  /* Guest Registration Form */
                  <form onSubmit={handleRegisterGuestAndBook} className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-1">
                      <span className="text-[10px] font-bold text-accent-cyan uppercase tracking-widest">
                        Datos del Invitado
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowGuestForm(false)}
                        className="text-[10px] text-slate-400 hover:text-white underline font-bold"
                      >
                        Volver
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-text-secondary uppercase block mb-0.5">Nombre *</label>
                        <input
                          type="text"
                          required
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          className="w-full bg-[#110e2e] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent-cyan/50"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-text-secondary uppercase block mb-0.5">Ap. Paterno *</label>
                        <input
                          type="text"
                          required
                          value={guestLastName}
                          onChange={(e) => setGuestLastName(e.target.value)}
                          className="w-full bg-[#110e2e] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent-cyan/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-text-secondary uppercase block mb-0.5">Ap. Materno</label>
                        <input
                          type="text"
                          value={guestSecondLastName}
                          onChange={(e) => setGuestSecondLastName(e.target.value)}
                          className="w-full bg-[#110e2e] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent-cyan/50"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-text-secondary uppercase block mb-0.5">DNI</label>
                        <input
                          type="text"
                          value={guestDni}
                          onChange={(e) => setGuestDni(e.target.value)}
                          className="w-full bg-[#110e2e] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent-cyan/50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-bold text-text-secondary uppercase block mb-0.5">Celular</label>
                        <input
                          type="text"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          className="w-full bg-[#110e2e] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent-cyan/50"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold text-text-secondary uppercase block mb-0.5">Correo</label>
                        <input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="w-full bg-[#110e2e] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent-cyan/50"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2 bg-accent-cyan hover:bg-cyan-400 disabled:bg-slate-700 text-slate-950 font-bold uppercase text-[11px] tracking-wider rounded-xl transition-all cursor-pointer mt-2"
                    >
                      {loading ? 'Guardando e Inscribiendo...' : 'Inscribir y Reservar Seat'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Bottom Actions button */}
          {associatedReservation ? (
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
          ) : (
            !showGuestForm && selectedSocio && (
              <button
                onClick={handleBookSeat}
                disabled={loading}
                className="w-full py-3 bg-brand-green hover:bg-emerald-400 disabled:bg-slate-700 text-slate-950 rounded-xl font-bold uppercase text-xs tracking-wider transition-all mt-4 cursor-pointer"
              >
                {loading ? 'Reservando...' : `Reservar para ${selectedSocio.nombre}`}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
};
