import React, { useState, useEffect } from 'react';
import type { User, GymClass, ClassSpot } from '../../domain/entities';
import {
  mockPromos,
  mockClassesState,
  generateMockSeats,
  addReservation
} from '../../data/mockData';
import { Header } from '../components/Header';
import { PromoCarousel } from '../components/PromoCarousel';
import { ClassCard } from '../components/ClassCard';
import { SeatMap } from '../components/SeatMap';
import { AdminDashboard } from '../components/AdminDashboard';

interface DashboardPageProps {
  user: User;
  onLogout: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user, onLogout }) => {
  const [selectedClass, setSelectedClass] = useState<GymClass>(mockClassesState[0]);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [seats, setSeats] = useState<ClassSpot[]>([]);
  
  // Modals / notification states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bookedSeatId, setBookedSeatId] = useState<number | null>(null);

  // Generate or retrieve seat states whenever selected class changes
  useEffect(() => {
    if (user.role === 'member' && selectedClass) {
      const classSeats = generateMockSeats(selectedClass.id);
      setSeats(classSeats);
      setSelectedSeat(null); // Clear selected seat on class switch
    }
  }, [selectedClass, user.role]);

  const handleSeatSelect = (seatId: number) => {
    setSelectedSeat((prev) => (prev === seatId ? null : seatId));
  };

  const handleBook = () => {
    if (selectedSeat === null) return;
    
    // Build reservation entity
    const newRes = {
      id: 'res-' + Math.random().toString(36).substring(2, 9),
      classId: selectedClass.id,
      seatId: selectedSeat,
      userEmail: user.email,
      userName: user.name,
      attended: false,
      timestamp: new Date().toISOString()
    };

    // Attempt reservation with simulated concurrency protection
    const result = addReservation(newRes);

    if (result.success) {
      setBookedSeatId(selectedSeat);
      setShowSuccessModal(true);
      // Reload seat layout matching new reservation state
      setSeats(generateMockSeats(selectedClass.id));
    } else {
      setErrorMessage(result.message);
      setShowErrorModal(true);
    }
    
    setSelectedSeat(null);
  };

  return (
    <div className="min-h-screen bg-[#0f0b21] flex flex-col pb-20 relative">
      
      {/* Background glow graphics */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-brand-green/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent-cyan/5 rounded-full blur-[120px] pointer-events-none"></div>

      <Header user={user} onLogout={onLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full flex-grow flex flex-col space-y-10">
        
        {/* Conditional rendering based on role */}
        {user.role === 'admin' ? (
          <div className="space-y-6">
            <section className="glass-panel rounded-3xl p-6 md:p-8 border border-white/5 relative overflow-hidden">
              <span className="text-xs font-bold text-brand-green uppercase tracking-widest bg-brand-green/10 px-3 py-1 rounded-full">Panel Administrativo</span>
              <h1 className="text-2xl md:text-3xl font-black text-white mt-3 leading-tight tracking-tight">
                Consola de Control • {user.name} 👑
              </h1>
              <p className="text-sm text-text-secondary mt-1">Programa horarios de clases de baile, gestiona instructores y audita la asistencia de los socios en tiempo real.</p>
            </section>

            <AdminDashboard onLogout={onLogout} />
          </div>
        ) : (
          /* Member View Dashboard */
          <>
            {/* User Welcome Banner */}
            <section className="glass-panel rounded-3xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between border border-white/5 relative overflow-hidden">
              <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-brand-green/10 to-transparent pointer-events-none"></div>
              <div>
                <span className="text-xs font-bold text-brand-green uppercase tracking-widest bg-brand-green/10 px-3 py-1 rounded-full">Socio Activo • {user.subscriptionType}</span>
                <h1 className="text-2xl md:text-3xl font-black text-white mt-3 leading-tight tracking-tight">
                  Hola, {user.name} 👋
                </h1>
                <p className="text-sm text-text-secondary mt-1">¿Listo para entrenar hoy? Reserva tu posición favorita en el salón de clases.</p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-3 bg-slate-950/40 border border-white/5 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green font-bold">
                  💪
                </div>
                <div>
                  <p className="text-xs text-text-secondary font-medium">Próxima reserva</p>
                  <p className="text-xs font-bold text-white">Ninguna programada</p>
                </div>
              </div>
            </section>

            {/* Promotions Carousel Section */}
            <section className="w-full">
              <PromoCarousel promos={mockPromos} />
            </section>

            {/* Dynamic Class Selection & Studio Seat Layout split */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left panel: Class Selector Cards */}
              <div className="lg:col-span-1 space-y-4">
                <div className="px-1">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-brand-green rounded-full"></span>
                    Clases disponibles hoy
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">Elige la sesión para ver el mapa de reserva</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  {mockClassesState.map((gymClass) => (
                    <div key={gymClass.id} className="h-56">
                      <ClassCard
                        gymClass={gymClass}
                        isSelected={selectedClass.id === gymClass.id}
                        onSelect={() => setSelectedClass(gymClass)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Right panel: Active Studio Booking Seat Map */}
              <div className="lg:col-span-2 space-y-4">
                <div className="px-1 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-5 bg-accent-cyan rounded-full"></span>
                    Mapa del Salón • {selectedClass.title}
                  </h2>
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold text-brand-green bg-brand-green/10 px-2.5 py-1 rounded-lg">
                      Profesor: {selectedClass.instructor}
                    </span>
                    <span className="text-[10px] text-text-secondary mt-1">Ubicación: {selectedClass.roomName || 'Salón Principal'}</span>
                  </div>
                </div>

                <SeatMap
                  seats={seats}
                  selectedSeat={selectedSeat}
                  onSeatSelect={handleSeatSelect}
                />
              </div>

            </section>
          </>
        )}

      </main>

      {/* Slide-in Drawer for active seat selection */}
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

      {/* Success Notification Modal */}
      {showSuccessModal && (
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
              }}
              className="mt-6 w-full py-3 bg-brand-green hover:bg-brand-green-strong text-slate-950 font-black rounded-xl uppercase tracking-wider text-xs transition-colors cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Concurrency Error Notification Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm glass-panel border border-rose-500/20 rounded-3xl p-8 text-center relative shadow-2xl scale-in">
            <div className="w-16 h-16 bg-rose-500/20 border-2 border-rose-500 rounded-full flex items-center justify-center mx-auto text-rose-400 shadow-lg shadow-rose-500/10">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-xl font-black text-white mt-6">Fallo de Concurrencia</h3>
            <p className="text-sm text-text-secondary mt-2 px-1 text-slate-300">
              {errorMessage}
            </p>
            <button
              onClick={() => {
                setShowErrorModal(false);
                setErrorMessage('');
              }}
              className="mt-6 w-full py-3 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-xl uppercase tracking-wider text-xs transition-colors cursor-pointer"
            >
              Cerrar y elegir otro
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
