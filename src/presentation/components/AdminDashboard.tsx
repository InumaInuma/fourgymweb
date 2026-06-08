import React, { useState, useEffect } from 'react';
import type { GymClass, Reservation, ClassSpot } from '../../domain/entities';
import {
  mockInstructors,
  mockClassesState,
  mockReservationsState,
  addClass,
  toggleAttendance,
  generateMockSeats
} from '../../data/mockData';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
  // Tabs: 'schedule' (programar clases) | 'attendance' (asistencia)
  const [activeTab, setActiveTab] = useState<'schedule' | 'attendance'>('schedule');

  // Classes list loaded from mock state
  const [classes, setClasses] = useState<GymClass[]>(mockClassesState);
  const [selectedClass, setSelectedClass] = useState<GymClass>(classes[0] || null);
  const [seats, setSeats] = useState<ClassSpot[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>(mockReservationsState);

  // Active seat detail popover state
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null);
  const [associatedReservation, setAssociatedReservation] = useState<Reservation | null>(null);

  // Form states for class scheduling
  const [classTitle, setClassTitle] = useState('Zumba Fitness');
  const [instructorId, setInstructorId] = useState('inst-2');
  const [roomName, setRoomName] = useState('Salón Principal');
  const [classTime, setClassTime] = useState('6:00 p.m.');
  const [classPrice, setClassPrice] = useState('20.00');
  const [formSuccess, setFormSuccess] = useState(false);

  // Load seats whenever the selected class or reservations change
  useEffect(() => {
    if (selectedClass) {
      const classSeats = generateMockSeats(selectedClass.id);
      setSeats(classSeats);
      setSelectedSeatId(null);
      setAssociatedReservation(null);
    }
  }, [selectedClass, reservations]);

  // Update lists when a reservation check-in toggles
  const handleToggleAttendance = (resId: string) => {
    const success = toggleAttendance(resId);
    if (success) {
      // Refresh local states
      const updatedReservations = [...mockReservationsState];
      setReservations(updatedReservations);
      
      // Update active popover display
      const currentRes = updatedReservations.find((r) => r.id === resId);
      if (currentRes) {
        setAssociatedReservation({ ...currentRes });
      }
    }
  };

  const handleSeatClick = (seatId: number) => {
    setSelectedSeatId(seatId);
    
    // Find if there is a reservation for this seat in the selected class
    const foundRes = reservations.find(
      (r) => r.classId === selectedClass.id && r.seatId === seatId
    );

    if (foundRes) {
      setAssociatedReservation({ ...foundRes });
    } else {
      setAssociatedReservation(null);
    }
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const instructorObj = mockInstructors.find((i) => i.id === instructorId);
    const newClass: GymClass = {
      id: 'class-' + (classes.length + 1),
      title: classTitle,
      rating: 5.0,
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop',
      instructor: instructorObj ? instructorObj.name : 'Profesor Externo',
      instructorId: instructorId,
      time: classTime,
      spotsTotal: 58,
      spotsReserved: 0,
      price: parseFloat(classPrice) || 20.0,
      roomName: roomName
    };

    addClass(newClass);
    setClasses([...mockClassesState]);
    
    // If no class was selected, set this new one as active
    if (!selectedClass) {
      setSelectedClass(newClass);
    }

    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 3000);

    // Reset some inputs
    setClassTime('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Panel: Navigation Tabs & Stats summary */}
      <div className="lg:col-span-1 space-y-6">
        <div className="glass-card flex flex-col space-y-4">
          <h2 className="text-lg font-bold text-white uppercase tracking-tight">Menú Administrativo</h2>
          
          <button
            onClick={() => setActiveTab('schedule')}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wider uppercase text-left transition-all ${
              activeTab === 'schedule'
                ? 'bg-brand-green text-slate-950 shadow-md shadow-brand-green/10'
                : 'bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            📅 Programar Clases
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm tracking-wider uppercase text-left transition-all ${
              activeTab === 'attendance'
                ? 'bg-brand-green text-slate-950 shadow-md shadow-brand-green/10'
                : 'bg-white/5 border border-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            👥 Validar Asistencia
          </button>
        </div>

        {/* Dashboard summary stats card */}
        <div className="glass-card bg-[#263238]/40 border border-white/5 rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-widest">Resumen del Día</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 text-center">
              <span className="text-2xl font-black text-brand-green">{classes.length}</span>
              <span className="block text-[10px] text-text-secondary mt-1">Clases hoy</span>
            </div>
            <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 text-center">
              <span className="text-2xl font-black text-accent-cyan">{reservations.length}</span>
              <span className="block text-[10px] text-text-secondary mt-1">Reservas</span>
            </div>
          </div>
          <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 text-center">
            <span className="text-2xl font-black text-emerald-400">
              {reservations.length > 0
                ? Math.round((reservations.filter((r) => r.attended).length / reservations.length) * 100)
                : 0}
              %
            </span>
            <span className="block text-[10px] text-text-secondary mt-1">Porcentaje Asistencia</span>
          </div>
        </div>
      </div>

      {/* Right Panels: Forms and Hexagonal Attendance Validator */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Tab 1: Class Scheduler */}
        {activeTab === 'schedule' && (
          <div className="glass-card relative overflow-hidden">
            <div className="border-b border-white/5 pb-4 mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="w-1.5 h-6 bg-brand-green rounded-full"></span>
                Programación de Nuevas Clases
              </h2>
              <p className="text-xs text-text-secondary mt-1">Completa los datos para agendar una sesión en el plano del gimnasio</p>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Clase de Baile</label>
                  <select
                    value={classTitle}
                    onChange={(e) => setClassTitle(e.target.value)}
                    className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-green"
                  >
                    <option value="Salsa & Bachata">Salsa & Bachata</option>
                    <option value="Zumba Fitness">Zumba Fitness</option>
                    <option value="Baile Urbano">Baile Urbano</option>
                    <option value="Ritmos Latinos">Ritmos Latinos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Profesor / Instructor</label>
                  <select
                    value={instructorId}
                    onChange={(e) => setInstructorId(e.target.value)}
                    className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-green"
                  >
                    {mockInstructors.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.name} ({instructor.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Salón de Baile</label>
                  <select
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-green"
                  >
                    <option value="Salón Principal">Salón Principal</option>
                    <option value="Salón A">Salón A</option>
                    <option value="Salón B">Salón B</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Horario</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 6:00 p.m. o 8:30 p.m."
                    value={classTime}
                    onChange={(e) => setClassTime(e.target.value)}
                    className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-green"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Precio de Entrada (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ej. 25.00"
                    value={classPrice}
                    onChange={(e) => setClassPrice(e.target.value)}
                    className="w-full bg-[#263238]/60 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-green"
                  />
                </div>
              </div>

              {formSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Clase programada exitosamente. Se ha agregado al listado.
                </div>
              )}

              <button
                type="submit"
                className="w-full py-4 px-6 bg-brand-green hover:bg-brand-green-strong text-slate-950 font-black rounded-xl uppercase tracking-wider text-xs shadow-lg transition-all"
              >
                Crear Horario de Clase
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Attendance Check-In Panel */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            
            {/* Active Class Selector for check-in monitoring */}
            <div className="glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">Validar Asistencias por Clase</h2>
                <p className="text-xs text-text-secondary mt-0.5">Selecciona la sesión para auditar la asistencia en el mapa de asientos</p>
              </div>
              <div className="relative">
                <select
                  value={selectedClass?.id}
                  onChange={(e) => {
                    const found = classes.find((c) => c.id === e.target.value);
                    if (found) setSelectedClass(found);
                  }}
                  className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-green"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.time})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Attendance Layout Grid split split */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Seat Selection hexagonal floor map */}
              <div className="xl:col-span-2 bg-slate-900/40 border border-white/5 rounded-3xl p-6 flex flex-col items-center">
                <span className="text-xs text-text-secondary mb-4 uppercase tracking-widest font-semibold">Haz clic en los asientos ocupados (color rosa)</span>
                
                {/* TARIMA Stage */}
                <div className="w-40 h-10 bg-slate-950 border border-white/5 rounded-lg flex items-center justify-center text-xs font-bold text-slate-400 mb-6 uppercase">
                  Escenario / Tarima
                </div>

                <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 w-full justify-center">
                  {seats.map((seat) => {
                    // Check if selected or occupied
                    const isSelected = selectedSeatId === seat.id;
                    const hasReservation = reservations.some(
                      (r) => r.classId === selectedClass.id && r.seatId === seat.id
                    );

                    let seatBg = 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10';
                    if (hasReservation) {
                      const resDetail = reservations.find(
                        (r) => r.classId === selectedClass.id && r.seatId === seat.id
                      );
                      seatBg = resDetail?.attended
                        ? 'bg-emerald-500 text-slate-950 font-bold border border-emerald-400 shadow-md shadow-emerald-500/10'
                        : 'bg-accent-pink text-white font-bold border border-rose-400';
                    }

                    if (isSelected) {
                      seatBg = 'ring-2 ring-brand-green bg-white text-slate-950 font-black';
                    }

                    if (seat.id === 42) {
                      return (
                        <div key="stair" className="aspect-square bg-slate-950 rounded flex items-center justify-center text-[8px] text-white/30 font-bold">
                          ESC.
                        </div>
                      );
                    }

                    return (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat.id)}
                        style={{
                          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                        }}
                        className={`aspect-square flex items-center justify-center text-[10px] transition-all cursor-pointer ${seatBg}`}
                      >
                        {seat.id + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Attendance Check-In detail card panel */}
              <div className="xl:col-span-1 glass-card flex flex-col justify-between min-h-[350px]">
                {selectedSeatId === null ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <span className="text-4xl">👥</span>
                    <h3 className="text-sm font-bold text-white">Ningún Lugar Seleccionado</h3>
                    <p className="text-xs text-text-secondary">Haz clic en un asiento de la grilla para validar el ingreso de un socio o realizar check-in.</p>
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
                              {new Date(associatedReservation.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2 pt-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${associatedReservation.attended ? 'bg-emerald-500 animate-ping' : 'bg-accent-pink'}`}></span>
                            <span className={`text-xs font-bold uppercase tracking-wider ${associatedReservation.attended ? 'text-emerald-400' : 'text-accent-pink'}`}>
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
                        onClick={() => handleToggleAttendance(associatedReservation.id)}
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

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
