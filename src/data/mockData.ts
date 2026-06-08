import type { Promo, GymClass, ClassSpot, Instructor, Reservation } from '../domain/entities';

export const mockPromos: Promo[] = [
  {
    id: 'promo-1',
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop',
    discount: 'Hasta 55% DSCTO',
    title: 'Membresías Trimestrales y Anuales'
  },
  {
    id: 'promo-2',
    imageUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=600&auto=format&fit=crop',
    discount: 'Equipos Nuevos',
    title: 'Zona de Cardio y Pesas Renovada'
  },
  {
    id: 'promo-3',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop',
    discount: 'Clases Gratis',
    title: 'Clases de Ritmos Latinos los Sábados'
  }
];

export const mockInstructors: Instructor[] = [
  { id: 'inst-1', name: 'Carlos Mendoza', specialty: 'Salsa & Bachata' },
  { id: 'inst-2', name: 'Laura Silva', specialty: 'Zumba Fitness' },
  { id: 'inst-3', name: 'Bboy Jordan', specialty: 'Baile Urbano' },
  { id: 'inst-4', name: 'Marta Rivas', specialty: 'Pilates & Ritmos' }
];

// Stateful lists for mockup demonstrations
export let mockClassesState: GymClass[] = [
  {
    id: 'class-1',
    title: 'Salsa & Bachata',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?q=80&w=600&auto=format&fit=crop',
    instructor: 'Carlos Mendoza',
    instructorId: 'inst-1',
    time: '6:00 p.m.',
    spotsTotal: 58,
    spotsReserved: 24,
    price: 25.00,
    roomName: 'Salón A'
  },
  {
    id: 'class-2',
    title: 'Zumba Fitness',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop',
    instructor: 'Laura Silva',
    instructorId: 'inst-2',
    time: '7:15 p.m.',
    spotsTotal: 58,
    spotsReserved: 38,
    price: 20.00,
    roomName: 'Salón Principal'
  },
  {
    id: 'class-3',
    title: 'Baile Urbano',
    rating: 5.0,
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop',
    instructor: 'Bboy Jordan',
    instructorId: 'inst-3',
    time: '8:30 p.m.',
    spotsTotal: 58,
    spotsReserved: 12,
    price: 22.00,
    roomName: 'Salón B'
  }
];

export let mockReservationsState: Reservation[] = [
  {
    id: 'res-1',
    classId: 'class-1',
    seatId: 10,
    userEmail: 'ana.gomez@fourgym.com',
    userName: 'ANA GOMEZ',
    attended: false,
    timestamp: '2026-06-07T18:00:00Z'
  },
  {
    id: 'res-2',
    classId: 'class-1',
    seatId: 22,
    userEmail: 'roberto.diaz@fourgym.com',
    userName: 'ROBERTO DIAZ',
    attended: true,
    timestamp: '2026-06-07T18:05:00Z'
  },
  {
    id: 'res-3',
    classId: 'class-2',
    seatId: 5,
    userEmail: 'pedro.sanchez@fourgym.com',
    userName: 'PEDRO SANCHEZ',
    attended: false,
    timestamp: '2026-06-07T18:10:00Z'
  }
];

// Helper methods for state manipulation
export const addClass = (newClass: GymClass) => {
  mockClassesState = [...mockClassesState, newClass];
};

export const addReservation = (reservation: Reservation): { success: boolean; message: string } => {
  // Concurrency check simulation:
  // 1. Check if seat is already occupied in pre-existing mockup reservations
  const isTaken = mockReservationsState.some(
    (r) => r.classId === reservation.classId && r.seatId === reservation.seatId
  );
  if (isTaken) {
    return {
      success: false,
      message: '¡Conflicto de Concurrencia! Este lugar acaba de ser reservado por otro socio hace un instante.'
    };
  }

  // 2. Simulate random real-time race-condition conflict (15% chance) to showcase the alert notification
  if (Math.random() < 0.15) {
    return {
      success: false,
      message: 'Error de Transacción (Optimistic Lock): Otro socio reservó este asiento en el mismo milisegundo. Por favor, intente con otra posición.'
    };
  }

  mockReservationsState = [...mockReservationsState, reservation];
  
  // Update spotsReserved counter in classes state
  mockClassesState = mockClassesState.map((c) => {
    if (c.id === reservation.classId) {
      return { ...c, spotsReserved: c.spotsReserved + 1 };
    }
    return c;
  });

  return {
    success: true,
    message: 'Reserva exitosa.'
  };
};

export const toggleAttendance = (reservationId: string): boolean => {
  let updated = false;
  mockReservationsState = mockReservationsState.map((r) => {
    if (r.id === reservationId) {
      updated = true;
      return { ...r, attended: !r.attended };
    }
    return r;
  });
  return updated;
};

// Generates 58 seat states: status 0 is free, 1 is occupied
export const generateMockSeats = (classId: string): ClassSpot[] => {
  return Array.from({ length: 58 }, (_, index) => {
    // 1. Check in stateful mock reservations if this seat is taken
    const isReserved = mockReservationsState.find(
      (r) => r.classId === classId && r.seatId === index
    );

    if (isReserved) {
      return {
        id: index,
        status: 1 // Occupied
      };
    }

    // 2. Base distribution for demo (stair block is excluded/occupied)
    let status: 0 | 1 = 0;
    if (index === 42) {
      status = 1;
    }

    // Static distribution fallback based on index to fill the room nicely
    const seed = classId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    if ((index + seed) % 6 === 0) {
      status = 1;
    }

    return {
      id: index,
      status
    };
  });
};
