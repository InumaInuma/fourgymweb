import type { User, GymClass, Reservation, Instructor } from '../domain/entities';
import api, { type ApiResponse } from './api';
import type { AxiosRequestConfig } from 'axios';

const getClassImage = (title: string): string => {
  const t = title.toLowerCase();
  if (t.includes('salsa') || t.includes('bachata') || t.includes('latinos')) {
    return 'https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?q=80&w=600&auto=format&fit=crop';
  }
  if (t.includes('zumba') || t.includes('cardio')) {
    return 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600&auto=format&fit=crop';
  }
  if (t.includes('urbano') || t.includes('hip')) {
    return 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600&auto=format&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=600&auto=format&fit=crop';
};

const formatTime = (dateStr: string): string => {
  const d = new Date(dateStr);
  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minStr = minutes < 10 ? '0' + minutes : minutes;
  return `${hours}:${minStr} ${ampm}`;
};

export const parseTimeToDateTime = (timeStr: string, dateStr?: string): { inicio: string; fin: string } => {
  const dateBase = dateStr ? new Date(dateStr + 'T00:00:00') : new Date();
  const match = timeStr.toLowerCase().match(/(\d+):(\d+)\s*(a\.m\.|p\.m\.|am|pm)?/);
  let hours = 8;
  let minutes = 0;
  if (match) {
    hours = parseInt(match[1], 10);
    minutes = parseInt(match[2], 10);
    const ampm = match[3];
    if (ampm && (ampm.includes('p') || ampm.includes('pm'))) {
      if (hours < 12) hours += 12;
    } else if (ampm && (ampm.includes('a') || ampm.includes('am'))) {
      if (hours === 12) hours = 0;
    }
  } else {
    const simple = timeStr.split(':');
    if (simple.length >= 2) {
      hours = parseInt(simple[0], 10);
      minutes = parseInt(simple[1], 10);
    }
  }
  const inicio = new Date(dateBase.getFullYear(), dateBase.getMonth(), dateBase.getDate(), hours, minutes, 0);
  const fin = new Date(inicio.getTime() + 60 * 60 * 1000); // 1 hour duration

  const toLocalISOString = (d: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  return {
    inicio: toLocalISOString(inicio),
    fin: toLocalISOString(fin)
  };
};

export const apiService = {
  async login(email: string): Promise<User> {
    try {
      const res = await api.post<ApiResponse<any>>('/Auth/login', { email });
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error en la autenticación.');
      }

      const data = res.data;
      return {
        id: data.idUsuario.toString(),
        name: `${data.nombre} ${data.apellidoPaterno}`.toUpperCase(),
        email: data.correo,
        initials: `${data.nombre[0] || ''}${data.apellidoPaterno[0] || ''}`.toUpperCase() || 'GY',
        role: data.idRol === 1 ? 'admin' : 'member',
        subscriptionType: data.tipoSuscripcion || (data.idRol === 1 ? 'Admin Staff' : 'Premium'),
        idSocio: data.idSocio || undefined,
      };
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error en la autenticación.';
      throw new Error(errMsg);
    }
  },

  async getClases(
    pageNumber?: number,
    pageSize?: number,
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<GymClass[]> {
    try {
      const config: AxiosRequestConfig = {};
      if (pageNumber !== undefined || pageSize !== undefined || fechaInicio || fechaFin) {
        config.params = {
          pageNumber,
          pageSize,
          fechaInicio,
          fechaFin,
        };
      }
      const res = await api.get<ApiResponse<any[]>>('/Clases', config);
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al obtener las clases.');
      }

      return res.data.map((item: any) => ({
        id: item.idClase.toString(),
        title: item.titulo,
        rating: 5.0,
        image: getClassImage(item.titulo),
        instructor: item.nombreInstructor,
        instructorId: item.idInstructor.toString(),
        time: formatTime(item.fechaInicio),
        spotsTotal: item.capacidad,
        spotsReserved: item.asientosOcupados,
        price: item.precio,
        roomName: item.roomName,
        fechaInicio: item.fechaInicio,
        fechaFin: item.fechaFin,
        totalCount: item.totalCount,
      }));
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener las clases.';
      throw new Error(errMsg);
    }
  },

  async getInstructores(): Promise<Instructor[]> {
    try {
      const res = await api.get<ApiResponse<any[]>>('/Instructores');
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al obtener los instructores.');
      }
      return res.data.map((item: any) => ({
        id: item.idInstructor.toString(),
        name: item.nombreInstructor,
        specialty: item.especialidad,
        avatarUrl: item.fotoUrl || undefined,
      }));
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener los instructores.';
      throw new Error(errMsg);
    }
  },

  async programarClase(clase: {
    titulo: string;
    description?: string;
    idInstructor: number;
    roomName: string;
    capacidad: number;
    precio: number;
    fechaInicio: string;
    fechaFin: string;
    usuarioModificacion?: string;
  }): Promise<number> {
    try {
      const res = await api.post<ApiResponse<number>>('/Clases/programar', {
        ...clase,
        descripcion: clase.description || '',
      });
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al programar la clase.');
      }
      return res.data; // Retorna idClaseCreada
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al programar la clase.';
      throw new Error(errMsg);
    }
  },

  async actualizarClase(id: number, clase: {
    titulo: string;
    description?: string;
    idInstructor: number;
    roomName: string;
    capacidad: number;
    precio: number;
    fechaInicio: string;
    fechaFin: string;
    usuarioModificacion?: string;
  }): Promise<boolean> {
    try {
      const res = await api.put<ApiResponse<boolean>>(`/Clases/${id}`, {
        ...clase,
        descripcion: clase.description || '',
      });
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al actualizar la clase.');
      }
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al actualizar la clase.';
      throw new Error(errMsg);
    }
  },

  async getReservasClase(idClase: number): Promise<Reservation[]> {
    try {
      const res = await api.get<ApiResponse<any[]>>(`/Reservas/clase/${idClase}`);
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al obtener las reservas.');
      }

      return res.data.map((item: any) => ({
        id: item.idReserva.toString(),
        classId: item.idClase.toString(),
        seatId: item.asientoId,
        userEmail: item.correoSocio,
        userName: item.nombreSocio,
        attended: item.asistio,
        timestamp: item.fechaReserva,
      }));
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener las reservas.';
      throw new Error(errMsg);
    }
  },

  async getReservasSocio(idSocio: number): Promise<any[]> {
    try {
      const res = await api.get<ApiResponse<any[]>>(`/Reservas/socio/${idSocio}`);
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al obtener las reservas.');
      }
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener las reservas.';
      throw new Error(errMsg);
    }
  },

  async crearReserva(idClase: number, asientoId: number, idSocio: number, usuario: string): Promise<{ success: boolean; message: string; idReserva?: number }> {
    try {
      const res = await api.post<ApiResponse<any>>('/Reservas', {
        idClase,
        asientoId,
        idSocio,
        usuarioModificacion: usuario,
      });

      return {
        success: res.data?.success ?? false,
        message: res.message || 'Reserva creada con éxito.',
        idReserva: res.data?.idReserva,
      };
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'El asiento ya ha sido reservado por otro socio. Por favor, selecciona otra ubicación.';
      return {
        success: false,
        message: errMsg,
      };
    }
  },

  async cancelarReserva(idReserva: number, usuario: string): Promise<boolean> {
    try {
      const res = await api.delete<ApiResponse<boolean>>(`/Reservas/${idReserva}?usuarioModificacion=${encodeURIComponent(usuario)}`);
      return res.isSuccess && res.data;
    } catch (err) {
      return false;
    }
  },

  async actualizarAsistencia(idReserva: number, asistio: boolean, usuario: string): Promise<boolean> {
    try {
      const res = await api.put<ApiResponse<boolean>>('/Reservas/check-in', {
        idReserva,
        asistio,
        usuarioModificacion: usuario,
      });
      return res.isSuccess && res.data;
    } catch (err) {
      return false;
    }
  },

  async getNotificacionesSocio(idUsuario: number): Promise<any[]> {
    try {
      const res = await api.get<ApiResponse<any[]>>(`/Notificaciones/socio/${idUsuario}`);
      return res.isSuccess ? res.data : [];
    } catch (err) {
      return [];
    }
  },

  async marcarNotificacionLeida(idNotificacionUsuario: number, usuario: string): Promise<boolean> {
    try {
      const res = await api.put<ApiResponse<boolean>>('/Notificaciones/marcar-leida', {
        idNotificacionUsuario,
        usuarioModificacion: usuario,
      });
      return res.isSuccess && res.data;
    } catch (err) {
      return false;
    }
  },

  async enviarNotificacionMasiva(titulo: string, mensaje: string, tipo: string, usuario: string): Promise<boolean> {
    try {
      const res = await api.post<ApiResponse<boolean>>('/Notificaciones/masiva', {
        titulo,
        mensaje,
        tipo,
        usuarioModificacion: usuario,
      });
      return res.isSuccess && res.data;
    } catch (err) {
      return false;
    }
  },
};
