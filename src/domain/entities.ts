export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: 'admin' | 'member' | 'trainer' | 'nutritionist' | 'instructor' | 'receptionist';
  avatarUrl?: string;
  subscriptionType?: string;
  idSocio?: number;
  token?: string;
}

export interface Promo {
  id: string;
  imageUrl: string;
  discount: string;
  title: string;
}

export interface Instructor {
  id: string;
  name: string;
  specialty: string;
  avatarUrl?: string;
}

export interface GymClass {
  id: string;
  title: string;
  rating: number;
  image: string;
  instructor: string; // Keep as string for display convenience
  instructorId: string;
  time: string;
  spotsTotal: number;
  spotsReserved: number;
  price: number;
  roomName?: string;
  fechaInicio?: string;
  fechaFin?: string;
  totalCount?: number;
}

export interface ClassSpot {
  id: number;
  status: 0 | 1 | 2; // 0 = Free, 1 = Occupied, 2 = Selected/Yours
  occupantName?: string;
}

export interface Reservation {
  id: string;
  classId: string;
  seatId: number;
  userEmail: string;
  userName: string;
  attended: boolean; // For check-in verification
  timestamp: string;
}
