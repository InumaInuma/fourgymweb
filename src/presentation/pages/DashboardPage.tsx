import React, { useState, useEffect } from 'react';
import type { User, GymClass, ClassSpot } from '../../domain/entities';
import { apiService } from '../../data/apiService';
import { useReservasHub } from '../../data/useReservasHub';
import { SeatMap } from '../components/SeatMap';
import { AdminDashboard } from '../components/AdminDashboard';
import { TrainerDashboard } from '../components/trainer/TrainerDashboard';
import { NutritionistDashboard } from '../components/nutritionist/NutritionistDashboard';
import { MemberSidebar } from '../components/member/MemberSidebar';
import { MemberBottomBar } from '../components/member/MemberBottomBar';
import { MemberBookings } from '../components/member/MemberBookings';
import { MemberNotifications } from '../components/member/MemberNotifications';
import { ClassCarousel } from '../components/ClassCarousel';
import { BarFitSection } from '../components/BarFitSection';
import { MemberSubscription } from '../components/member/MemberSubscription';
import { MemberRoutine } from '../components/member/MemberRoutine';
import { MemberNutrition } from '../components/member/MemberNutrition';
import { MemberAppointments } from '../components/member/MemberAppointments';

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user, onLogout }) => {
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<GymClass | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [seats, setSeats] = useState<ClassSpot[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const getNext7Days = () => {
    const days = [];
    const base = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
      days.push(d);
    }
    return days;
  };

  // Tabs navigation state for members: 'home' | 'classes' | 'bookings' | 'notifications' | 'subscription' | 'routine' | 'nutrition' | 'appointments'
  const [activeTab, setActiveTab] = useState<'home' | 'classes' | 'bookings' | 'notifications' | 'subscription' | 'routine' | 'nutrition' | 'appointments'>('home');

  // Toggle state for MemberSidebar on mobile screens
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState<any[]>([]);

  // Modals / notification states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bookedSeatId, setBookedSeatId] = useState<number | null>(null);

  // Home summary states
  const [activeRoutine, setActiveRoutine] = useState<any | null>(null);
  const [activeDiet, setActiveDiet] = useState<any | null>(null);
  const [nextAppointment, setNextAppointment] = useState<any | null>(null);

  const loadSummaryData = async () => {
    if (!user.idSocio) return;
    try {
      const [routine, diet, appointments] = await Promise.all([
        apiService.getSocioRutinaActiva(user.idSocio).catch(() => null),
        apiService.getSocioPlanAlimentario(user.idSocio).catch(() => null),
        apiService.getSocioCitas(user.idSocio).catch(() => []),
      ]);
      setActiveRoutine(routine);
      setActiveDiet(diet);
      if (appointments && appointments.length > 0) {
        const upcoming = appointments
          .filter((a: any) => a.estado === 'Programada' && new Date(a.fechaHora) >= new Date())
          .sort((a: any, b: any) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())[0];
        setNextAppointment(upcoming || null);
      } else {
        setNextAppointment(null);
      }
    } catch (err) {
      console.error('Error loading summary data:', err);
    }
  };

  // Fetch classes on mount (do NOT automatically select a class so user sees listing first)
  useEffect(() => {
    const loadClasses = async () => {
      try {
        setLoadingClasses(true);
        const data = await apiService.getClases();
        setClasses(data);
      } catch (err) {
        console.error('Error fetching classes:', err);
      } finally {
        setLoadingClasses(false);
      }
    };
    loadClasses();
  }, []);

  // Fetch notifications
  const loadNotifications = async () => {
    if (user && user.role === 'member') {
      try {
        const data = await apiService.getNotificacionesSocio(parseInt(user.id, 10));
        setNotifications(data);
      } catch (err) {
        console.error('Error loading notifications:', err);
      }
    }
  };

  useEffect(() => {
    if (user.role === 'member') {
      loadNotifications();
      loadSummaryData();
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadSeats = async (classId: string) => {
    try {
      const activeReservations = await apiService.getReservasClase(parseInt(classId, 10));
      const newSeats = Array.from({ length: 58 }, (_, index) => {
        const res = activeReservations.find((r) => r.seatId - 1 === index);
        return {
          id: index,
          status: res ? (1 as const) : (0 as const),
          occupantName: res ? res.userName : undefined,
        };
      });
      setSeats(newSeats);
    } catch (err) {
      console.error('Error loading seats:', err);
    }
  };

  // Load seats once when the selected class changes
  useEffect(() => {
    if (user.role === 'member' && selectedClass && (activeTab === 'classes' || activeTab === 'home')) {
      loadSeats(selectedClass.id);
      setSelectedSeat(null);
    }
  }, [selectedClass, user.role, activeTab]);

  // SignalR: real-time updates when another member books a seat.
  useReservasHub({
    idClase: user.role === 'member' && (activeTab === 'classes' || activeTab === 'home') && selectedClass ? parseInt(selectedClass.id, 10) : null,
    onSeatReservado: (payload) => {
      setSeats((prev) =>
        prev.map((s) =>
          s.id === payload.asientoId - 1
            ? { ...s, status: 1 as const, occupantName: payload.nombreSocio }
            : s
        )
      );
    },
    onSeatLiberado: (payload) => {
      setSeats((prev) =>
        prev.map((s) =>
          s.id === payload.asientoId - 1
            ? { ...s, status: 0 as const, occupantName: undefined }
            : s
        )
      );
    },
  });

  const handleSeatSelect = (seatId: number) => {
    setSelectedSeat((prev) => (prev === seatId ? null : seatId));
  };

  const handleBook = async () => {
    if (selectedSeat === null || !selectedClass) return;
    
    const result = await apiService.crearReserva(
      parseInt(selectedClass.id, 10),
      selectedSeat + 1,
      user.idSocio || 0,
      user.name
    );

    if (result.success) {
      setBookedSeatId(selectedSeat);
      setShowSuccessModal(true);
      
      // Reload seat layout matching new reservation state
      loadSeats(selectedClass.id);
      
      // Update the classes state to increment occupied seat counter
      setClasses(prev => prev.map(c => {
        if (c.id === selectedClass.id) {
          return { ...c, spotsReserved: c.spotsReserved + 1 };
        }
        return c;
      }));
    } else {
      setErrorMessage(result.message);
      setShowErrorModal(true);
    }
    
    setSelectedSeat(null);
  };

  const handleReservationCancelled = () => {
    // Reload classes and update selected class details
    const reload = async () => {
      try {
        const data = await apiService.getClases();
        setClasses(data);
        if (selectedClass) {
          const updatedSelected = data.find(c => c.id === selectedClass.id);
          if (updatedSelected) {
            setSelectedClass(updatedSelected);
            loadSeats(updatedSelected.id);
          }
        }
      } catch (err) {
        console.error('Error reloading after cancellation:', err);
      }
    };
    reload();
  };

  const handleMarkNotificationAsRead = async (idNotificacionUsuario: number) => {
    try {
      const success = await apiService.marcarNotificacionLeida(idNotificacionUsuario, user.name);
      if (success) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.idNotificacionUsuario === idNotificacionUsuario ? { ...n, leida: true } : n
          )
        );
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Resets selected class when selecting tabs to ensure user lands back on classes list
  const handleTabChange = (tab: 'home' | 'classes' | 'bookings' | 'notifications' | 'subscription' | 'routine' | 'nutrition' | 'appointments') => {
    setActiveTab(tab);
    if (tab === 'classes' || tab === 'home') {
      setSelectedClass(null);
      setSelectedSeat(null);
    }
  };

  const isLimitError = errorMessage.toLowerCase().includes('ya tiene') || errorMessage.toLowerCase().includes('límite');
  const modalTitle = isLimitError ? 'Límite de Reserva' : 'Fallo de Concurrencia';
  const modalButtonText = isLimitError ? 'Entendido' : 'Cerrar y elegir otro';

  const unreadNotificationsCount = notifications.filter((n) => !n.leida).length;

  const renderSeatMap = () => {
    if (!selectedClass) return null;
    return (
      <>
        {/* Back button to classes list */}
        <button
          onClick={() => {
            setSelectedClass(null);
            setSelectedSeat(null);
          }}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer font-bold text-xs uppercase tracking-widest mb-4 active:scale-95 shrink-0 self-start"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l-7.5-7.5M3 12h18" />
          </svg>
          <span>Volver a Clases</span>
        </button>

        {/* Selected Class Header card details */}
        <div className="glass-panel border border-white/5 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full relative overflow-hidden shrink-0">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-accent-cyan/10 to-transparent pointer-events-none"></div>
          <div>
            <span className="text-[10px] font-black uppercase bg-accent-cyan/10 text-accent-cyan px-2.5 py-1 rounded-lg border border-accent-cyan/20">
              Sala de Reservas
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-white mt-3 tracking-tight">
              {selectedClass.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary mt-1.5 font-bold">
              <span className="text-brand-green">Profesor: {selectedClass.instructor}</span>
              <span>•</span>
              <span>Ubicación: {selectedClass.roomName || 'Salón Principal'}</span>
              <span>•</span>
              <span>Horario: {selectedClass.time}</span>
            </div>
          </div>

          <div className="flex items-baseline space-x-2 bg-slate-950/40 border border-white/5 rounded-2xl p-4 shrink-0">
            <div className="text-right">
              <span className="text-[9px] text-text-secondary font-bold uppercase tracking-wider block">Precio</span>
              <span className="text-xl font-black text-white font-mono">
                {selectedClass.price === 0 ? <span className="text-emerald-400">GRATIS</span> : `S/ ${selectedClass.price.toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Hexagonal Interactive Seat Map floor */}
        <section id="seat-map-section" className="w-full mt-4">
          <div className="bg-[#141226]/60 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col items-center relative shadow-2xl overflow-hidden shadow-accent-cyan/5 w-full">
            <div className="flex flex-wrap items-center justify-between w-full border-b border-white/5 pb-3 mb-6 gap-2">
              <span className="text-xs text-slate-300 uppercase tracking-widest font-black">Distribución de Asientos</span>
              <span className="text-[10px] text-slate-400 font-bold">Selecciona una posición hexagonal libre en la sala de baile</span>
            </div>
            
            <SeatMap
              seats={seats}
              selectedSeat={selectedSeat}
              onSeatSelect={handleSeatSelect}
            />
          </div>
        </section>
      </>
    );
  };

  if (user.role === 'admin' || user.role === 'receptionist') {
    return <AdminDashboard user={user} onLogout={onLogout} />;
  }

  if (user.role === 'trainer') {
    return <TrainerDashboard user={user} onLogout={onLogout} />;
  }

  if (user.role === 'nutritionist') {
    return <NutritionistDashboard user={user} onLogout={onLogout} />;
  }

  return (
    <div className="flex min-h-screen bg-[#0f0b21] w-full text-white relative overflow-hidden">
      
      {/* Background glow graphics */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-brand-green/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent-cyan/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Member Sidebar (Responsive fixed right on mobile, sticky left on desktop) */}
      <MemberSidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        unreadNotificationsCount={unreadNotificationsCount}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area (padding bottom adjusted for mobile bar) */}
      <div className="flex-grow flex flex-col p-4 md:p-8 overflow-y-auto max-h-screen w-full relative z-10 pb-24 md:pb-8">
        
        {/* Tab 1: Inicio (Home / Dashboard) */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            
            {/* Screen A: Browse Classes Carousel (when selectedClass is null) */}
            {selectedClass === null ? (
              <>
                {/* Sleek Minimal Welcome Bar */}
                <div className="px-1 mb-2">
                  <h1 className="text-2xl font-black text-white tracking-tight">
                    Hola, {user.name.split(' ')[0]} 👋
                  </h1>
                  <p className="text-xs text-text-secondary">Socio Activo • <span className="text-brand-green font-bold">{user.subscriptionType || 'Premium'}</span></p>
                </div>

                {/* Rolling 7-Day Calendar Bar */}
                {loadingClasses ? null : (
                  <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-none mb-2 mt-4">
                    {getNext7Days().map((date, idx) => {
                      const isSame = date.getFullYear() === selectedDate.getFullYear() &&
                                     date.getMonth() === selectedDate.getMonth() &&
                                     date.getDate() === selectedDate.getDate();
                      const dayName = idx === 0 ? 'Hoy' : date.toLocaleDateString('es-ES', { weekday: 'short' }).slice(0, 3).toUpperCase();
                      const dayNum = date.getDate();
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedDate(date)}
                          className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-2xl border transition-all cursor-pointer ${
                            isSame
                              ? 'bg-brand-green border-brand-green text-slate-950 shadow-md shadow-brand-green/20'
                              : 'bg-slate-950/40 border-white/5 text-slate-300 hover:border-white/20'
                          }`}
                        >
                          <span className="text-[9px] font-black tracking-wider uppercase opacity-75">{dayName}</span>
                          <span className="text-base font-black mt-0.5">{dayNum}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Horizontal Scroll Carousel */}
                {loadingClasses ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-bold">Cargando clases...</div>
                ) : classes.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    No hay clases programadas disponibles.
                  </div>
                ) : (() => {
                  const now = new Date();
                  const dayFiltered = classes.filter(c => {
                    const cDate = new Date(c.fechaInicio ?? '');
                    const isSameDate = cDate.getFullYear() === selectedDate.getFullYear() &&
                                       cDate.getMonth() === selectedDate.getMonth() &&
                                       cDate.getDate() === selectedDate.getDate();
                    if (!isSameDate) return false;

                    // Filtrar clases que ya iniciaron hace más de 30 minutos
                    const startTime = new Date(c.fechaInicio ?? '').getTime();
                    const limitTime = startTime + 30 * 60 * 1000;
                    return limitTime > now.getTime();
                  });

                  if (dayFiltered.length === 0) {
                    return (
                      <div className="text-center py-12 bg-slate-950/20 border border-white/5 rounded-3xl p-6 text-slate-400 text-xs font-bold">
                        No hay clases programadas para este día.
                      </div>
                    );
                  }

                  return (
                    <ClassCarousel
                      classes={dayFiltered}
                      onSelectClass={(c) => setSelectedClass(c)}
                    />
                  );
                })()}

                {/* Mi Enfoque de Hoy Section */}
                {!loadingClasses && (
                  <div className="w-full space-y-4 pt-4 border-t border-white/5">
                    <div className="px-1">
                      <h2 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-brand-green rounded-full animate-pulse"></span>
                        Mi enfoque de hoy
                      </h2>
                      <p className="text-xs text-text-secondary mt-1">Sigue tu plan diario de entrenamiento y nutrición para maximizar tus resultados.</p>
                    </div>

                    {/* Next Appointment Alert Bar */}
                    {nextAppointment && (
                      <div className="bg-brand-green/10 border border-brand-green/20 text-brand-green rounded-2xl p-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-base">📅</span>
                          <span>
                            Cita de <strong>{nextAppointment.tipoCita}</strong> con <strong>{nextAppointment.nombreEspecialista}</strong> el <strong>{(() => {
                              const d = new Date(nextAppointment.fechaHora);
                              return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).toUpperCase();
                            })()}</strong>
                          </span>
                        </div>
                        <button 
                          onClick={() => setActiveTab('appointments')} 
                          className="text-[9px] font-black uppercase bg-brand-green text-slate-950 px-2.5 py-1.5 rounded-lg shrink-0 cursor-pointer active:scale-95 transition-all"
                        >
                          Ver Citas
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      {/* Workout Box */}
                      <div className="glass-panel border border-white/5 rounded-3xl p-5 flex flex-col justify-between hover:border-brand-green/20 transition-all duration-300">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-brand-green/10 text-brand-green px-2.5 py-1 rounded-lg border border-brand-green/20">
                              Rutina Diaria
                            </span>
                            <span className="text-lg">🏋️</span>
                          </div>
                          {activeRoutine ? (
                            <>
                              <h3 className="text-sm font-black text-white uppercase">{activeRoutine.nombreRutina}</h3>
                              <p className="text-[11px] text-text-secondary mt-1">
                                Objetivo: <span className="text-slate-200 font-medium">{activeRoutine.objetivo}</span>
                              </p>
                              <p className="text-[10px] text-brand-green font-bold mt-2">
                                {activeRoutine.ejercicios?.length || 0} ejercicios asignados
                              </p>
                            </>
                          ) : (
                            <>
                              <h3 className="text-sm font-black text-white uppercase">Sin rutina activa</h3>
                              <p className="text-[11px] text-text-secondary mt-1">Pídele a tu entrenador que te asigne una rutina de ejercicios.</p>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => setActiveTab('routine')}
                          className="w-full py-2 bg-brand-green text-slate-950 hover:bg-emerald-400 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all mt-4 cursor-pointer text-center active:scale-95"
                        >
                          Entrenar Ahora
                        </button>
                      </div>

                      {/* Nutrition Box */}
                      <div className="glass-panel border border-white/5 rounded-3xl p-5 flex flex-col justify-between hover:border-accent-cyan/20 transition-all duration-300">
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-accent-cyan/10 text-accent-cyan px-2.5 py-1 rounded-lg border border-accent-cyan/20">
                              Nutrición & Plan
                            </span>
                            <span className="text-lg">🍎</span>
                          </div>
                          {activeDiet ? (
                            <>
                              <h3 className="text-sm font-black text-white uppercase">Plan Alimentario Activo</h3>
                              <p className="text-[11px] text-text-secondary mt-1">
                                Meta: <span className="text-slate-200 font-medium">{activeDiet.caloriasObjetivo} kcal / día</span>
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-[10px] text-accent-cyan font-bold uppercase tracking-wider">
                                <span>P: {activeDiet.porcentajeProteina}%</span>
                                <span>•</span>
                                <span>C: {activeDiet.porcentajeCarbohidratos}%</span>
                                <span>•</span>
                                <span>G: {activeDiet.porcentajeGrasa}%</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <h3 className="text-sm font-black text-white uppercase">Sin plan asignado</h3>
                              <p className="text-[11px] text-text-secondary mt-1">Pídele a tu nutricionista que te arme una dieta personalizada.</p>
                            </>
                          )}
                        </div>
                        <button
                          onClick={() => setActiveTab('nutrition')}
                          className="w-full py-2 bg-accent-cyan text-slate-950 hover:bg-cyan-400 font-black text-[10px] uppercase tracking-wider rounded-xl transition-all mt-4 cursor-pointer text-center active:scale-95"
                        >
                          Ver Mi Dieta
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bar Fit healthy beverages and snacks carousel */}
                {!loadingClasses && <BarFitSection />}
              </>
            ) : (
              /* Screen B: Seat Reservation Layout (when selectedClass is not null) */
              renderSeatMap()
            )}

          </div>
        )}

        {/* Tab 2: Clases (List of all classes) */}
        {activeTab === 'classes' && (
          <div className="space-y-6">
            
            {/* Screen A: Browse Classes Grid List (when selectedClass is null) */}
            {selectedClass === null ? (
              <>
                {/* Section Title */}
                <div className="px-1 border-b border-white/5 pb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-accent-cyan rounded-full"></span>
                    Clases Programadas
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">
                    Elige una clase programada abajo para ingresar al mapa de sala y reservar tu ubicación en tiempo real.
                  </p>
                </div>

                {/* Available Classes Grid */}
                {loadingClasses ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-bold">Cargando clases...</div>
                ) : (() => {
                  const now = new Date();
                  const activeClasses = classes.filter(c => {
                    const startTime = new Date(c.fechaInicio ?? '').getTime();
                    const limitTime = startTime + 30 * 60 * 1000;
                    return limitTime > now.getTime();
                  });

                  if (activeClasses.length === 0) {
                    return (
                      <div className="text-center py-12 text-slate-400 text-sm">
                        No hay clases programadas disponibles.
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeClasses.map((c) => {
                        const freeSpots = c.spotsTotal - c.spotsReserved;
                        const isFull = freeSpots <= 0;
                        return (
                          <div
                            key={c.id}
                            className="group bg-white/5 border border-white/10 hover:border-accent-cyan/40 hover:bg-white/10 hover:scale-[1.01] transition-all duration-300 rounded-3xl p-5 flex flex-col justify-between h-80 relative overflow-hidden"
                          >
                            {/* Image/Cover background simulation */}
                            <div className="absolute inset-0 z-0 opacity-15 pointer-events-none">
                              <img src={c.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent"></div>
                            </div>

                            <div className="relative z-10 flex flex-col justify-between h-full">
                              <div>
                                {/* Top badges */}
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] bg-slate-950/80 backdrop-blur-md text-slate-300 font-bold border border-white/10 px-2.5 py-1 rounded-lg">
                                    ⭐ {c.rating.toFixed(1)}
                                  </span>
                                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
                                    isFull 
                                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' 
                                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'
                                  }`}>
                                    {isFull ? 'Lleno' : `${freeSpots} libres`}
                                  </span>
                                </div>

                                {/* Title and Instructor */}
                                <h3 className="text-xl font-black text-white mt-4 tracking-tight group-hover:text-accent-cyan transition-colors leading-tight">
                                  {c.title}
                                </h3>
                                
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  <p className="text-xs text-brand-green font-semibold">Prof. {c.instructor}</p>
                                </div>
                                <p className="text-[10px] text-text-secondary mt-1 font-bold uppercase tracking-wider">{c.roomName || 'Salón Principal'}</p>
                              </div>

                              {/* Time, Price and CTA button */}
                              <div>
                                <div className="flex items-center justify-between border-t border-white/5 pt-3 mb-4 text-xs">
                                  <div className="flex items-center space-x-1.5 text-slate-300">
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-bold">{(() => {
                                      const d = new Date(c.fechaInicio ?? '');
                                      const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
                                      return `${d.toLocaleDateString('es-ES', options).toUpperCase()} - ${c.time}`;
                                    })()}</span>
                                  </div>
                                  <div className="font-black text-white font-mono bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">
                                    {c.price === 0 ? <span className="text-emerald-400">GRATIS</span> : `S/ ${c.price.toFixed(2)}`}
                                  </div>
                                </div>

                                <button
                                  disabled={isFull}
                                  onClick={() => setSelectedClass(c)}
                                  className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                                    isFull 
                                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' 
                                      : 'bg-accent-cyan text-slate-950 hover:bg-cyan-400 shadow-md shadow-accent-cyan/15 active:scale-95'
                                  }`}
                                >
                                  <span>Reservar Sitio</span>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </>
            ) : (
              /* Screen B: Seat Reservation Layout (when selectedClass is not null) */
              renderSeatMap()
            )}

          </div>
        )}

        {/* Tab 2: Mis Reservas */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <MemberBookings 
              user={user} 
              onReservationCancelled={handleReservationCancelled}
            />
          </div>
        )}

        {/* Tab 3: Notificaciones */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <MemberNotifications 
              notifications={notifications} 
              onMarkAsRead={handleMarkNotificationAsRead}
            />
          </div>
        )}

        {/* Tab 4: Mi Suscripción e Ingresos */}
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            <MemberSubscription idSocio={user.idSocio || parseInt(user.id, 10)} />
          </div>
        )}

        {/* Tab 5: Mi Entrenamiento */}
        {activeTab === 'routine' && (
          <div className="space-y-6">
            <MemberRoutine idSocio={user.idSocio || parseInt(user.id, 10)} />
          </div>
        )}

        {/* Tab 6: Mi Nutrición */}
        {activeTab === 'nutrition' && (
          <div className="space-y-6">
            <MemberNutrition idSocio={user.idSocio || parseInt(user.id, 10)} />
          </div>
        )}

        {/* Tab 7: Mis Citas */}
        {activeTab === 'appointments' && (
          <div className="space-y-6">
            <MemberAppointments idSocio={user.idSocio || parseInt(user.id, 10)} />
          </div>
        )}

      </div>

      {/* Member Bottom Bar (Mobile only) */}
      <MemberBottomBar
        user={user}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        unreadNotificationsCount={unreadNotificationsCount}
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Slide-in Drawer for active seat selection */}
      {selectedClass && (activeTab === 'classes' || activeTab === 'home') && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-white/10 shadow-2xl transition-all duration-500 ease-in-out transform ${
            selectedSeat !== null ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
          }`}
        >
          <div className="max-w-4xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan animate-pulse">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              
              <div>
                <p className="text-sm font-black text-white uppercase tracking-tight">
                  {selectedClass.title} • Lugar {selectedSeat !== null ? selectedSeat + 1 : ''}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary mt-0.5">
                  <span>Sesión hoy: {selectedClass.time}</span>
                  <span>•</span>
                  <span>Precio: S/ {selectedClass.price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6 justify-between md:justify-end">
              <div className="text-right">
                <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-wider block">Total a pagar</span>
                <span className="text-lg font-black text-white">S/ {selectedClass.price.toFixed(2)}</span>
              </div>

              <button
                onClick={handleBook}
                className="py-3 px-8 bg-accent-cyan hover:bg-cyan-400 text-slate-950 font-black rounded-xl shadow-lg shadow-accent-cyan/25 transition-all duration-200 uppercase tracking-widest text-xs cursor-pointer active:scale-95"
              >
                Reservar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Modal */}
      {showSuccessModal && selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm glass-panel border border-brand-green/20 rounded-3xl p-8 text-center relative shadow-2xl scale-in">
            <div className="w-16 h-16 bg-brand-green/20 border-2 border-brand-green rounded-full flex items-center justify-center mx-auto text-brand-green shadow-lg shadow-brand-green/10">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-white mt-6">¡Reserva Exitosa!</h3>
            <p className="text-sm text-text-secondary mt-2 px-1">
              Tu lugar <span className="text-brand-green font-bold">#{bookedSeatId !== null ? bookedSeatId + 1 : ''}</span> en la clase de <span className="text-white font-bold">{selectedClass.title}</span> ha sido reservado correctamente para hoy a las <span className="text-white font-bold">{selectedClass.time}</span>.
            </p>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                setBookedSeatId(null);
                // Return user to classes grid after successful booking
                setSelectedClass(null);
              }}
              className="mt-6 w-full py-3 bg-brand-green hover:bg-brand-green-strong text-slate-950 font-black rounded-xl uppercase tracking-wider text-xs transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Error / Validation Notification Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-sm glass-panel border ${isLimitError ? 'border-amber-500/20' : 'border-rose-500/20'} rounded-3xl p-8 text-center relative shadow-2xl scale-in`}>
            <div className={`w-16 h-16 ${isLimitError ? 'bg-amber-500/20 border-2 border-amber-500 text-amber-400 shadow-lg shadow-amber-500/10' : 'bg-rose-500/20 border-2 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/10'} rounded-full flex items-center justify-center mx-auto`}>
              {isLimitError ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
              )}
            </div>
            <h3 className="text-xl font-black text-white mt-6">{modalTitle}</h3>
            <p className="text-sm text-text-secondary mt-2 px-1 text-slate-300">
              {errorMessage}
            </p>
            <button
              onClick={() => {
                setShowErrorModal(false);
                setErrorMessage('');
              }}
              className={`mt-6 w-full py-3 ${isLimitError ? 'bg-amber-500 hover:bg-amber-600 text-slate-950' : 'bg-rose-500 hover:bg-rose-600 text-white'} font-black rounded-xl uppercase tracking-wider text-xs transition-colors cursor-pointer`}
            >
              {modalButtonText}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
