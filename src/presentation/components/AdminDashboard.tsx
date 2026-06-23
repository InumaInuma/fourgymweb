import React, { useState, useEffect } from 'react';
import type { GymClass, Reservation, ClassSpot, Instructor, User } from '../../domain/entities';
import { apiService, parseTimeToDateTime } from '../../data/apiService';
import { useReservasHub } from '../../data/useReservasHub';
import { BulkProgressOverlay } from './admin/BulkProgressOverlay';
import { SingleSchedulerForm } from './admin/SingleSchedulerForm';
import { BulkSchedulerForm } from './admin/BulkSchedulerForm';
import { ActiveClassesTable } from './admin/ActiveClassesTable';
import { ClassEditModal } from './admin/ClassEditModal';
import { AttendanceSeatMap } from './admin/AttendanceSeatMap';
import { SeatDetailsPanel } from './admin/SeatDetailsPanel';
import { AdminSidebar } from './admin/AdminSidebar';

interface BulkSlot {
  id: string;
  title: string;
  instructorId: string;
  roomName: string;
  startTime: string;
  endTime: string;
  price: string;
}

const standardHours = [
  '06:00 a.m.', '07:00 a.m.', '08:00 a.m.', '09:00 a.m.', '10:00 a.m.', '11:00 a.m.', '12:00 p.m.',
  '01:00 p.m.', '02:00 p.m.', '03:00 p.m.', '04:00 p.m.', '05:00 p.m.', '06:00 p.m.', '07:00 p.m.',
  '08:00 p.m.', '09:00 p.m.', '10:00 p.m.', '11:00 p.m.', '12:00 a.m.'
];


interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  // Tabs: 'schedule' (programar clases) | 'attendance' (asistencia)
  const [activeTab, setActiveTab] = useState<'schedule' | 'attendance'>('schedule');

  // Classes list loaded from backend API
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<GymClass | null>(null);
  const [seats, setSeats] = useState<ClassSpot[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  // Active seat detail popover state
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null);
  const [associatedReservation, setAssociatedReservation] = useState<Reservation | null>(null);

  // Instructors list loaded from backend API
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  // Form states for class scheduling
  const [classTitle, setClassTitle] = useState('Zumba Fitness');
  const [instructorId, setInstructorId] = useState('');
  const [roomName, setRoomName] = useState('Salón Principal');
  const [classDate, setClassDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [classTime, setClassTime] = useState('6:00 p.m.');
  const [classPrice, setClassPrice] = useState('20.00');
  const [formSuccess, setFormSuccess] = useState(false);

  // States for class editing
  const [editingClass, setEditingClass] = useState<GymClass | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editInstructorId, setEditInstructorId] = useState('');
  const [editRoomName, setEditRoomName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndTime, setEditEndTime] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // Mode selection: 'single' for one class, 'bulk' for bulk scheduling (week/month)
  const [schedulingMode, setSchedulingMode] = useState<'single' | 'bulk'>('single');

  // Bulk schedule states
  const [bulkStartDate, setBulkStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bulkEndDate, setBulkEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30); // 1 month default
    return d.toISOString().split('T')[0];
  });
  const [bulkDays, setBulkDays] = useState<number[]>([1, 2, 3, 4, 5]); // default: Lunes a Viernes
  const [bulkSlots, setBulkSlots] = useState<BulkSlot[]>([
    { id: '1', title: 'Zumba Fitness', instructorId: '', roomName: 'Salón Principal', startTime: '08:00 a.m.', endTime: '09:00 a.m.', price: '20.00' },
    { id: '2', title: 'Ritmos Latinos', instructorId: '', roomName: 'Salón Principal', startTime: '09:00 a.m.', endTime: '10:00 a.m.', price: '20.00' },
    { id: '3', title: 'Baile Urbano', instructorId: '', roomName: 'Salón Principal', startTime: '10:00 a.m.', endTime: '11:00 a.m.', price: '20.00' },
    { id: '4', title: 'Zumba Fitness', instructorId: '', roomName: 'Salón Principal', startTime: '07:00 p.m.', endTime: '08:00 p.m.', price: '20.00' },
  ]);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number } | null>(null);

  // Paging and filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterStartDate, setFilterStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [filterEndDate, setFilterEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [totalClassesCount, setTotalClassesCount] = useState(0);

  // Fetch classes list with paging and filter parameters
  const loadClasses = async (page = currentPage, start = filterStartDate, end = filterEndDate) => {
    try {
      const data = await apiService.getClases(
        page,
        pageSize,
        start || undefined,
        end || undefined
      );
      setClasses(data);

      const count = data.length > 0 ? (data[0].totalCount || 0) : 0;
      setTotalClassesCount(count);

      if (data.length > 0 && !selectedClass) {
        setSelectedClass(data[0]);
      }
    } catch (err) {
      console.error('Error loading classes in admin dashboard:', err);
    }
  };

  const handleApplyFilter = () => {
    setCurrentPage(1);
    loadClasses(1, filterStartDate, filterEndDate);
  };

  const handleClearFilter = () => {
    const today = new Date().toISOString().split('T')[0];
    setFilterStartDate(today);
    setFilterEndDate(today);
    setCurrentPage(1);
    loadClasses(1, today, today);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadClasses(page, filterStartDate, filterEndDate);
  };

  // Fetch instructors list
  const loadInstructors = async () => {
    try {
      const data = await apiService.getInstructores();
      setInstructors(data);
      if (data.length > 0) {
        setInstructorId(data[0].id);
        // Pre-populate instructor IDs in bulk slots if empty
        setBulkSlots((prev) =>
          prev.map((slot) => ({
            ...slot,
            instructorId: slot.instructorId || data[0].id,
          }))
        );
      }
    } catch (err) {
      console.error('Error loading instructors in admin dashboard:', err);
    }
  };

  const getBulkClasesCount = () => {
    try {
      const start = new Date(bulkStartDate + 'T00:00:00');
      const end = new Date(bulkEndDate + 'T00:00:00');
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;
      
      let count = 0;
      const daysSet = new Set(bulkDays);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        if (daysSet.has(dayOfWeek)) {
          count += bulkSlots.length;
        }
      }
      return count;
    } catch (e) {
      return 0;
    }
  };

  const toggleBulkDay = (dayValue: number) => {
    setBulkDays((prev) =>
      prev.includes(dayValue) ? prev.filter((d) => d !== dayValue) : [...prev, dayValue]
    );
  };

  const addBulkSlot = () => {
    const nextHourIndex = (bulkSlots.length + 8) % standardHours.length;
    const nextHourEndIndex = (nextHourIndex + 1) % standardHours.length;
    
    setBulkSlots((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        title: 'Zumba Fitness',
        instructorId: instructors[0]?.id || '',
        roomName: 'Salón Principal',
        startTime: standardHours[nextHourIndex] || '08:00 a.m.',
        endTime: standardHours[nextHourEndIndex] || '09:00 a.m.',
        price: '20.00',
      }
    ]);
  };

  const removeBulkSlot = (id: string) => {
    if (bulkSlots.length <= 1) {
      alert('Debes tener al menos un horario en la programación masiva.');
      return;
    }
    setBulkSlots((prev) => prev.filter((s) => s.id !== id));
  };

  const updateBulkSlot = (id: string, field: keyof BulkSlot, value: string) => {
    setBulkSlots((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const updated = { ...s, [field]: value };
        if (field === 'startTime') {
          const startIndex = standardHours.indexOf(value);
          if (startIndex !== -1 && startIndex < standardHours.length - 1) {
            updated.endTime = standardHours[startIndex + 1];
          }
        }
        return updated;
      })
    );
  };

  const handleBulkScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const start = new Date(bulkStartDate + 'T00:00:00');
    const end = new Date(bulkEndDate + 'T00:00:00');
    if (start > end) {
      alert('La fecha de inicio debe ser anterior o igual a la fecha de fin.');
      return;
    }
    
    if (bulkDays.length === 0) {
      alert('Debes seleccionar al menos un día de la semana.');
      return;
    }

    const targetDates: string[] = [];
    const daysSet = new Set(bulkDays);
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayOfWeek = d.getDay();
      if (daysSet.has(dayOfWeek)) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        targetDates.push(`${yyyy}-${mm}-${dd}`);
      }
    }
    
    const totalToCreate = targetDates.length * bulkSlots.length;
    if (totalToCreate === 0) {
      alert('No se encontraron fechas coincidentes con los días seleccionados.');
      return;
    }
    
    setBulkProgress({ current: 0, total: totalToCreate });
    
    let createdCount = 0;
    
    try {
      for (const dateStr of targetDates) {
        for (const slot of bulkSlots) {
          const { inicio } = parseTimeToDateTime(slot.startTime, dateStr);
          const finParsed = parseTimeToDateTime(slot.endTime, dateStr).inicio;
          
          await apiService.programarClase({
            titulo: slot.title,
            idInstructor: parseInt(slot.instructorId, 10),
            roomName: slot.roomName,
            capacidad: 58,
            precio: isNaN(parseFloat(slot.price)) ? 20.0 : parseFloat(slot.price),
            fechaInicio: inicio,
            fechaFin: finParsed,
            usuarioModificacion: 'AdminStaff'
          });
          
          createdCount++;
          setBulkProgress({ current: createdCount, total: totalToCreate });
        }
      }
      
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 3000);
      await loadClasses();
    } catch (err) {
      console.error('Error in bulk scheduling:', err);
      alert('Ocurrió un error al programar algunas clases. Por favor verifica el listado.');
    } finally {
      setBulkProgress(null);
    }
  };

  useEffect(() => {
    loadClasses();
    loadInstructors();
  }, []);

  // Load reservations and seat states whenever the selected class or activeTab changes
  const loadClassReservations = async () => {
    if (!selectedClass) return;
    try {
      const classReservations = await apiService.getReservasClase(parseInt(selectedClass.id, 10));
      setReservations(classReservations);
      
      const newSeats = Array.from({ length: 58 }, (_, index) => {
        const res = classReservations.find((r) => r.seatId - 1 === index);
        return {
          id: index,
          status: res ? (1 as const) : (0 as const),
          occupantName: res ? res.userName : undefined,
        };
      });
      setSeats(newSeats);

      if (selectedSeatId !== null) {
        const currentRes = classReservations.find((r) => r.seatId - 1 === selectedSeatId);
        setAssociatedReservation(currentRes || null);
      }
    } catch (err) {
      console.error('Error loading class reservations:', err);
    }
  };

  useEffect(() => {
    if (selectedClass) {
      loadClassReservations();
    }
  }, [selectedClass, activeTab]);

  useReservasHub({
    idClase: activeTab === 'attendance' && selectedClass ? parseInt(selectedClass.id, 10) : null,
    onSeatReservado: (payload) => {
      setSeats((prev) =>
        prev.map((s) =>
          s.id === payload.asientoId - 1
            ? { ...s, status: 1 as const, occupantName: payload.nombreSocio }
            : s
        )
      );
      loadClassReservations();
    },
    onAsistenciaActualizada: () => {
      loadClassReservations();
    },
  });

  const handleToggleAttendance = async (resId: string) => {
    const currentRes = reservations.find((r) => r.id === resId);
    if (!currentRes) return;
    
    try {
      const success = await apiService.actualizarAsistencia(
        parseInt(resId, 10),
        !currentRes.attended,
        'AdminStaff'
      );
      if (success) {
        await loadClassReservations();
      }
    } catch (err) {
      console.error('Error toggling attendance:', err);
    }
  };

  const handleSeatClick = (seatId: number) => {
    setSelectedSeatId(seatId);
    const foundRes = reservations.find((r) => r.seatId - 1 === seatId);
    setAssociatedReservation(foundRes || null);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { inicio, fin } = parseTimeToDateTime(classTime, classDate);
      await apiService.programarClase({
        titulo: classTitle,
        idInstructor: parseInt(instructorId, 10),
        roomName: roomName,
        capacidad: 58,
        precio: isNaN(parseFloat(classPrice)) ? 20.0 : parseFloat(classPrice),
        fechaInicio: inicio,
        fechaFin: fin,
        usuarioModificacion: 'AdminStaff'
      });

      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 3000);
      await loadClasses();
      setClassTime('');
    } catch (err) {
      console.error('Error scheduling class:', err);
    }
  };

  const handleEditClick = (c: GymClass) => {
    setEditingClass(c);
    setEditTitle(c.title);
    setEditInstructorId(c.instructorId);
    setEditRoomName(c.roomName || 'Salón Principal');
    setEditPrice(c.price.toString());

    const formatLocalTimeForDropdown = (dateStr: string): string => {
      const d = new Date(dateStr);
      let hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const hourStr = hours < 10 ? '0' + hours : hours;
      const minStr = minutes < 10 ? '0' + minutes : minutes;
      return `${hourStr}:${minStr} ${ampm}`;
    };
    
    if (c.fechaInicio) {
      const datePart = c.fechaInicio.split('T')[0];
      setEditDate(datePart);
      setEditStartTime(formatLocalTimeForDropdown(c.fechaInicio));
    } else {
      setEditDate(new Date().toISOString().split('T')[0]);
      setEditStartTime('06:00 p.m.');
    }

    if (c.fechaFin) {
      setEditEndTime(formatLocalTimeForDropdown(c.fechaFin));
    } else {
      setEditEndTime('07:00 p.m.');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;
    
    try {
      const { inicio } = parseTimeToDateTime(editStartTime, editDate);
      const finParsed = parseTimeToDateTime(editEndTime, editDate).inicio;
      
      const success = await apiService.actualizarClase(parseInt(editingClass.id, 10), {
        titulo: editTitle,
        idInstructor: parseInt(editInstructorId, 10),
        roomName: editRoomName,
        capacidad: editingClass.spotsTotal,
        precio: isNaN(parseFloat(editPrice)) ? 20.0 : parseFloat(editPrice),
        fechaInicio: inicio,
        fechaFin: finParsed,
        usuarioModificacion: 'AdminStaff'
      });

      if (success) {
        setEditingClass(null);
        await loadClasses();
      }
    } catch (err) {
      console.error('Error updating class:', err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f0b21] w-full text-white relative overflow-hidden">
      {/* Background glow graphics */}
      <div className="absolute top-10 right-10 w-96 h-96 bg-brand-green/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent-cyan/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Collapsible Admin Sidebar */}
      <AdminSidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
      />

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col p-6 md:p-8 overflow-y-auto max-h-screen w-full relative z-10">
        
        {/* Page title / Welcome Banner */}
        <section className="glass-panel rounded-3xl p-6 md:p-8 border border-white/5 relative overflow-hidden mb-6 shrink-0">
          <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-brand-green/10 to-transparent pointer-events-none"></div>
          <span className="text-xs font-bold text-brand-green uppercase tracking-widest bg-brand-green/10 px-3 py-1 rounded-full">
            Panel Administrativo
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-white mt-3 leading-tight tracking-tight">
            Consola de Control • {user.name} 👑
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Programa horarios de clases de baile, gestiona instructores y audita la asistencia de los socios en tiempo real.
          </p>
        </section>

        {/* Stats summary row at top of main content */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 shrink-0">
          <div className="glass-card bg-[#263238]/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Clases Hoy</span>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-2xl md:text-3xl font-black text-brand-green">{classes.length}</span>
              <span className="text-xs text-text-secondary">activas</span>
            </div>
          </div>
          
          <div className="glass-card bg-[#263238]/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Total Reservas</span>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-2xl md:text-3xl font-black text-accent-cyan">{reservations.length}</span>
              <span className="text-xs text-text-secondary">asientos reservados</span>
            </div>
          </div>

          <div className="glass-card bg-[#263238]/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-widest">Asistencia</span>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-2xl md:text-3xl font-black text-emerald-400">
                {reservations.length > 0
                  ? Math.round((reservations.filter((r) => r.attended).length / reservations.length) * 100)
                  : 0}
                %
              </span>
              <span className="text-xs text-text-secondary">check-ins</span>
            </div>
          </div>
        </div>

        {/* Main interactive area: Form/Table or Attendance Map */}
        <div className="flex-grow">
          {/* Tab 1: Class Scheduler */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <div className="glass-card relative overflow-hidden">
                {/* Bulk progress loader overlay */}
                {bulkProgress && <BulkProgressOverlay current={bulkProgress.current} total={bulkProgress.total} />}

                <div className="border-b border-white/5 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="w-1.5 h-6 bg-brand-green rounded-full"></span>
                      Programación de Clases
                    </h2>
                    <p className="text-xs text-text-secondary mt-1">
                      Agenda clases individuales o genera un cronograma semanal/mensual recurrente de forma sencilla.
                    </p>
                  </div>

                  <div className="flex bg-[#263238]/60 p-1 rounded-xl border border-white/5 self-start sm:self-auto font-bold">
                    <button
                      type="button"
                      onClick={() => setSchedulingMode('single')}
                      className={`px-4 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-wider cursor-pointer ${
                        schedulingMode === 'single'
                          ? 'bg-brand-green text-slate-950 shadow-md shadow-brand-green/15'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Clase Única
                    </button>
                    <button
                      type="button"
                      onClick={() => setSchedulingMode('bulk')}
                      className={`px-4 py-2 rounded-lg text-xs font-black transition-all uppercase tracking-wider cursor-pointer ${
                        schedulingMode === 'bulk'
                          ? 'bg-brand-green text-slate-950 shadow-md shadow-brand-green/15'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Masivo / Recurrente
                    </button>
                  </div>
                </div>

                {schedulingMode === 'single' ? (
                  <SingleSchedulerForm
                    classTitle={classTitle}
                    setClassTitle={setClassTitle}
                    instructorId={instructorId}
                    setInstructorId={setInstructorId}
                    roomName={roomName}
                    setRoomName={setRoomName}
                    classDate={classDate}
                    setClassDate={setClassDate}
                    classTime={classTime}
                    setClassTime={setClassTime}
                    classPrice={classPrice}
                    setClassPrice={setClassPrice}
                    formSuccess={formSuccess}
                    instructors={instructors}
                    onSubmit={handleScheduleSubmit}
                  />
                ) : (
                  <BulkSchedulerForm
                    bulkStartDate={bulkStartDate}
                    setBulkStartDate={setBulkStartDate}
                    bulkEndDate={bulkEndDate}
                    setBulkEndDate={setBulkEndDate}
                    bulkDays={bulkDays}
                    toggleBulkDay={toggleBulkDay}
                    bulkSlots={bulkSlots}
                    addBulkSlot={addBulkSlot}
                    removeBulkSlot={removeBulkSlot}
                    updateBulkSlot={updateBulkSlot}
                    getBulkClasesCount={getBulkClasesCount}
                    onSubmit={handleBulkScheduleSubmit}
                    instructors={instructors}
                  />
                )}
              </div>

              {/* Clases Activas y Programadas card */}
              <ActiveClassesTable
                classes={classes}
                onEditClick={handleEditClick}
                currentPage={currentPage}
                pageSize={pageSize}
                totalItems={totalClassesCount}
                onPageChange={handlePageChange}
                filterStartDate={filterStartDate}
                setFilterStartDate={setFilterStartDate}
                filterEndDate={filterEndDate}
                setFilterEndDate={setFilterEndDate}
                onApplyFilter={handleApplyFilter}
                onClearFilter={handleClearFilter}
              />
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
                    value={selectedClass?.id || ''}
                    onChange={(e) => {
                      const found = classes.find((c) => c.id === e.target.value);
                      if (found) setSelectedClass(found);
                    }}
                    className="bg-slate-950 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-green"
                  >
                    <option value="" disabled>Selecciona una clase</option>
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
                <div className="xl:col-span-2 bg-[#141226]/60 backdrop-blur-md border border-white/5 rounded-3xl p-6 flex flex-col items-center relative shadow-2xl overflow-hidden shadow-accent-cyan/5">

                  <div className="flex flex-wrap items-center justify-between w-full border-b border-white/5 pb-3 mb-4 gap-2">
                    <span className="text-xs text-slate-300 uppercase tracking-widest font-black">Asistencia (Digital Twin)</span>
                    <span className="text-[10px] text-slate-400 font-bold">Haz clic en un asiento para ver detalles / realizar Check-In</span>
                  </div>
                  
                  {selectedClass ? (
                    <AttendanceSeatMap
                      seats={seats}
                      selectedSeatId={selectedSeatId}
                      reservations={reservations}
                      onSeatClick={handleSeatClick}
                    />
                  ) : (
                    <div className="text-slate-500 text-sm py-12 font-bold">
                      Selecciona una clase para ver el mapa de asistencia.
                    </div>
                  )}
                </div>

                {/* Attendance Check-In detail card panel */}
                <SeatDetailsPanel
                  selectedSeatId={selectedSeatId}
                  associatedReservation={associatedReservation}
                  onToggleAttendance={handleToggleAttendance}
                />

              </div>

            </div>
          )}
        </div>
      </div>

      {/* Modal de Edición de Clase */}
      {editingClass && (
        <ClassEditModal
          setEditingClass={setEditingClass}
          editTitle={editTitle}
          setEditTitle={setEditTitle}
          editInstructorId={editInstructorId}
          setEditInstructorId={setEditInstructorId}
          editRoomName={editRoomName}
          setEditRoomName={setEditRoomName}
          editDate={editDate}
          setEditDate={setEditDate}
          editStartTime={editStartTime}
          setEditStartTime={setEditStartTime}
          editEndTime={editEndTime}
          setEditEndTime={setEditEndTime}
          editPrice={editPrice}
          setEditPrice={setEditPrice}
          instructors={instructors}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
};
