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

const mapDtoToUser = (data: any): User => {
  let role: 'admin' | 'member' | 'trainer' | 'nutritionist' | 'instructor' | 'receptionist' = 'member';
  let subscriptionType = data.estado || 'Premium';
  
  if (data.idRol === 1) {
    role = 'admin';
    subscriptionType = 'Admin Staff';
  } else if (data.idRol === 2) {
    role = 'member';
  } else if (data.idRol === 3) {
    role = 'instructor';
    subscriptionType = 'Dance Instructor';
  } else if (data.idRol === 4) {
    role = 'trainer';
    subscriptionType = 'Musculación Coach';
  } else if (data.idRol === 5) {
    role = 'nutritionist';
    subscriptionType = 'Nutricionista Staff';
  } else if (data.idRol === 6) {
    role = 'receptionist';
    subscriptionType = 'Reception Staff';
  }

  return {
    id: data.idUsuario.toString(),
    name: `${data.nombre} ${data.apellidoPaterno}`.toUpperCase(),
    email: data.correo,
    initials: `${data.nombre[0] || ''}${data.apellidoPaterno[0] || ''}`.toUpperCase() || 'GY',
    role,
    subscriptionType,
    idSocio: data.idSocio || undefined,
  };
};

export interface PlanMembresia {
  id: number;
  nombre: string;
  duracionMeses: number;
  precio: number;
  activo: boolean;
}

export interface FormaPago {
  id: number;
  nombre: string;
}

export interface SocioConMembresia {
  idSocio: number;
  idPersona: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  numeroDocumento: string;
  telefono?: string;
  correo?: string;
  fechaNacimiento?: string;
  edad?: number;
  estadoSocio: string;
  idContrato?: number;
  estadoContrato?: string;
  formaPago?: string;
  montoPagado?: number;
  fechaInicioMembresia?: string;
  fechaFinMembresia?: string;
  estadoMembresia?: string;
  nombrePlan?: string;
  duracionMeses?: number;
}

export interface Colaborador {
  idUsuario: number;
  idPersona: number;
  idTenant: number;
  idSucursal?: number;
  nombreSucursal?: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  numeroDocumento: string;
  telefono?: string;
  correo?: string;
  idRol: number;
  nombreRol: string;
  activo: boolean;
}

export interface RegistrarColaboradorRequest {
  idSucursal?: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  numeroDocumento: string;
  idTipoDocumento: number;
  telefono?: string;
  correo?: string;
  idRol: number;
}

export interface ActualizarColaboradorRequest {
  idSucursal?: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono?: string;
  correo?: string;
  idRol: number;
  activo: boolean;
}

export interface Asistencia {
  id: number;
  idSocio: number;
  idSucursal: number;
  nombreSucursal: string;
  fechaHora: string;
  metodoIngreso: string;
}

export interface Cita {
  id: number;
  idSocio: number;
  idEspecialista: number;
  nombreEspecialista: string;
  fechaHora: string;
  tipoCita: 'Nutricion' | 'Entrenamiento';
  estado: 'Programada' | 'Realizada' | 'Cancelada';
  notas?: string;
}

export interface PlanAlimentario {
  id: number;
  idSocio: number;
  idNutricionista: number;
  fechaAsignacion: string;
  caloriasObjetivo: number;
  porcentajeProteina: number;
  porcentajeCarbohidratos: number;
  porcentajeGrasa: number;
  desayuno: string;
  colacion1?: string;
  almuerzo: string;
  merienda?: string;
  cena: string;
  usuarioModificacion?: string;
}

export interface EvaluacionAntropometrica {
  id: number;
  idSocio: number;
  idNutricionista: number;
  fechaEvaluacion: string;
  peso: number;
  porcentajeGrasa: number;
  porcentajeMusculo: number;
  grasaVisceral?: number;
  edadMetabolica?: number;
  usuarioModificacion?: string;
}

export interface RutinaEjercicio {
  id: number;
  idRutina: number;
  idEjercicio: number;
  nombreEjercicio: string;
  grupoMuscular: string;
  series: number;
  repeticiones: string;
  pesoAsignado?: string;
  rpeObjetivo?: number;
  diaSemana: number;
}

export interface Rutina {
  id: number;
  idSocio: number;
  idEntrenador: number;
  nombreRutina: string;
  objetivo?: string;
  fechaAsignacion: string;
  activa: boolean;
  ejercicios: RutinaEjercicio[];
}

export interface Sucursal {
  id: number;
  idTenant: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
}

export interface RegistrarSocioRequest {
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  numeroDocumento: string;
  idTipoDocumento?: number;
  telefono: string;
  fechaNacimiento: string;
  idPlanMembresia: number;
  precioPagado: number;
  idFormaPago: number;
}

export interface RenovarMembresiaRequest {
  idSocio: number;
  idPlanMembresia: number;
  precioOriginal: number;
  precioPagado: number;
  porcentajeDescuento: number;
  descuentoAutorizadoPor?: string;
  idFormaPago: number;
}

export interface CongelarMembresiaRequest {
  idSocio: number;
  fechaInicio: string;
  fechaFin: string;
  motivo: string;
  autorizadoPor: string;
}

export interface CambiarPlanRequest {
  idSocio: number;
  idPlanMembresia: number;
  precioOriginal: number;
  precioPagado: number;
  porcentajeDescuento: number;
  descuentoAutorizadoPor?: string;
  idFormaPago: number;
}

export interface SocioHistorialFinanciero {
  idContrato: number;
  nombrePlan: string;
  precioOriginal: number;
  montoPagado: number;
  porcentajeDescuento: number;
  descuentoAutorizadoPor?: string;
  formaPago: string;
  fechaVenta: string;
  nombreVendedor: string;
  anio: number;
}

export interface MembresiasPorVencer {
  vencenHoy: number;
  vencenManana: number;
  vencenEstaSemana: number;
}

export interface CajaSesionActiva {
  id: number;
  idTenant: number;
  idSucursal: number;
  idUsuario: number;
  fechaApertura: string;
  montoApertura: number;
  estado: string;
  comentario?: string;
}

export interface CajaBalance {
  montoApertura: number;
  membresiasEfectivo: number;
  membresiasYape: number;
  membresiasPlin: number;
  membresiasTransferencia: number;
  membresiasTarjeta: number;
  membresiasMixto: number;
  barFitEfectivo: number;
  barFitYape: number;
  barFitPlin: number;
  barFitTransferencia: number;
  barFitTarjeta: number;
  barFitMixto: number;
  ingresosManuales: number;
  egresosManuales: number;
  totalEfectivo: number;
  totalYape: number;
  totalPlin: number;
  totalTransferencia: number;
  totalTarjeta: number;
  totalMixto: number;
  totalTeorico: number;
}

export const apiService = {

  async login(email: string): Promise<User> {
    try {
      const res = await api.post<ApiResponse<any>>('/Auth/login', { email });
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error en la autenticación.');
      }
      return mapDtoToUser(res.data);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error en la autenticación.';
      throw new Error(errMsg);
    }
  },

  async checkDni(dni: string): Promise<{
    idPersona: number;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    correo: string;
    idUsuario: number;
    isRegistered: boolean;
    idRol: number;
  }> {
    try {
      const res = await api.post<ApiResponse<any>>('/Auth/check-dni', { numeroDocumento: dni });
      if (!res.isSuccess) {
        throw new Error(res.message || 'El DNI no está registrado en el sistema.');
      }
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al verificar DNI.';
      throw new Error(errMsg);
    }
  },

  async registerPassword(dni: string, password: string, email: string): Promise<User> {
    try {
      const res = await api.post<ApiResponse<any>>('/Auth/register-password', {
        numeroDocumento: dni,
        password: password,
        correo: email
      });
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al registrar la contraseña.');
      }
      return mapDtoToUser(res.data);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al registrar contraseña.';
      throw new Error(errMsg);
    }
  },

  async loginDni(dni: string, password: string): Promise<User> {
    try {
      const res = await api.post<ApiResponse<any>>('/Auth/login-dni', {
        numeroDocumento: dni,
        password: password
      });
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al iniciar sesión.');
      }
      return mapDtoToUser(res.data);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error en el inicio de sesión.';
      throw new Error(errMsg);
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post<ApiResponse<any>>('/Auth/logout');
    } catch (err) {
      // Ignorar errores al cerrar sesión en backend para garantizar que el frontend siempre limpie la sesión local
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

  // ==========================================================
  // MÓDULO DE NUTRICIÓN
  // ==========================================================

  async getSocios(): Promise<any[]> {
    try {
      const res = await api.get<ApiResponse<any[]>>('/Nutricion/socios');
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al obtener los socios.');
      }
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener los socios.';
      throw new Error(errMsg);
    }
  },

  async getHistorialClinico(idSocio: number): Promise<any> {
    try {
      const res = await api.get<ApiResponse<any>>(`/Nutricion/historial/${idSocio}`);
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al obtener historial clínico.');
      }
      return res.data;
    } catch (err: any) {
      // Si retorna 404 o null, significa que no tiene historial clínico previo, no arrojamos error
      return null;
    }
  },

  async guardarHistorialClinico(historial: {
    idSocio: number;
    idNutricionista: number;
    objetivoGeneral: string;
    antecedentesMedicos?: string;
    alergiasAlimentarias?: string;
    observaciones?: string;
    usuarioModificacion?: string;
  }): Promise<boolean> {
    try {
      const res = await api.post<ApiResponse<boolean>>('/Nutricion/historial', historial);
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al guardar historial clínico.');
      }
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al guardar historial clínico.';
      throw new Error(errMsg);
    }
  },

  async registrarEvaluacionAntropometrica(evaluacion: {
    idSocio: number;
    idNutricionista: number;
    peso: number;
    porcentajeGrasa: number;
    porcentajeMusculo: number;
    grasaVisceral: number;
    edadMetabolica: number;
    usuarioModificacion?: string;
  }): Promise<boolean> {
    try {
      const res = await api.post<ApiResponse<boolean>>('/Nutricion/evaluacion', evaluacion);
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al registrar evaluación antropométrica.');
      }
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al registrar evaluación antropométrica.';
      throw new Error(errMsg);
    }
  },

  async getEvaluacionesAntropometricas(idSocio: number): Promise<any[]> {
    try {
      const res = await api.get<ApiResponse<any[]>>(`/Nutricion/evaluaciones/${idSocio}`);
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al obtener evaluaciones antropométricas.');
      }
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener evaluaciones antropométricas.';
      throw new Error(errMsg);
    }
  },

  async guardarPlanAlimentario(plan: {
    idSocio: number;
    idNutricionista: number;
    caloriasObjetivo: number;
    porcentajeProteina: number;
    porcentajeCarbohidratos: number;
    porcentajeGrasa: number;
    desayuno: string;
    colacion1?: string;
    almuerzo: string;
    merienda?: string;
    cena: string;
    usuarioModificacion?: string;
  }): Promise<boolean> {
    try {
      const res = await api.post<ApiResponse<boolean>>('/Nutricion/plan', plan);
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al guardar el plan alimentario.');
      }
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al guardar el plan alimentario.';
      throw new Error(errMsg);
    }
  },

  async getPlanAlimentarioActivo(idSocio: number): Promise<any> {
    try {
      const res = await api.get<ApiResponse<any>>(`/Nutricion/plan-activo/${idSocio}`);
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al obtener el plan alimentario activo.');
      }
      return res.data;
    } catch (err: any) {
      return null;
    }
  },

  // ==========================================================
  // MÓDULO DE ENTRENAMIENTO
  // ==========================================================

  async registrarEvaluacionFisicaTrainer(evaluacion: {
    idSocio: number;
    idEntrenador: number;
    peso: number;
    masaMuscular: number;
    porcentajeGrasa: number;
    notasEvolucion?: string;
    usuarioModificacion?: string;
  }): Promise<boolean> {
    try {
      const res = await api.post<ApiResponse<boolean>>('/Entrenamiento/evaluacion', evaluacion);
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al registrar la evaluación física.');
      }
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al registrar la evaluación física.';
      throw new Error(errMsg);
    }
  },

  async getEvaluacionesFisicasTrainer(idSocio: number): Promise<any[]> {
    try {
      const res = await api.get<ApiResponse<any[]>>(`/Entrenamiento/evaluaciones/${idSocio}`);
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al obtener las evaluaciones físicas.');
      }
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener las evaluaciones físicas.';
      throw new Error(errMsg);
    }
  },

  async asignarRutinaTrainer(rutina: {
    idSocio: number;
    idEntrenador: number;
    nombreRutina: string;
    objetivo: string;
    ejercicios: Array<{
      nombreEjercicio: string;
      grupoMuscular: string;
      series: number;
      repeticiones: string;
      pesoAsignado?: string;
      rpeObjetivo?: number;
    }>;
    usuarioModificacion?: string;
  }): Promise<boolean> {
    try {
      const res = await api.post<ApiResponse<boolean>>('/Entrenamiento/rutina', rutina);
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al asignar la rutina.');
      }
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al asignar la rutina.';
      throw new Error(errMsg);
    }
  },

  async getRutinaActivaTrainer(idSocio: number): Promise<any> {
    try {
      const res = await api.get<ApiResponse<any>>(`/Entrenamiento/rutina-activa/${idSocio}`);
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al obtener la rutina activa.');
      }
      return res.data;
    } catch (err: any) {
      return null;
    }
  },

  // ==========================================================
  // MÓDULO DE MEMBRESÍAS Y MATRÍCULAS
  // ==========================================================

  async getPlanesMembresias(): Promise<PlanMembresia[]> {
    try {
      const res = await api.get<ApiResponse<PlanMembresia[]>>('/Membresias/planes');
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al obtener los planes de membresía.');
      }
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener los planes de membresía.';
      throw new Error(errMsg);
    }
  },

  async crearPlanMembresia(plan: Omit<PlanMembresia, 'id' | 'activo'>): Promise<number> {
    try {
      const res = await api.post<ApiResponse<number>>('/Membresias/planes', {
        nombre: plan.nombre,
        duracionMeses: plan.duracionMeses,
        precio: plan.precio,
        activo: true
      });
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al crear el plan de membresía.');
      }
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al crear el plan de membresía.';
      throw new Error(errMsg);
    }
  },

  async actualizarPlanMembresia(id: number, plan: PlanMembresia): Promise<boolean> {
    try {
      const res = await api.put<ApiResponse<boolean>>(`/Membresias/planes/${id}`, plan);
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al actualizar el plan de membresía.');
      }
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al actualizar el plan de membresía.';
      throw new Error(errMsg);
    }
  },

  async getSociosConMembresias(): Promise<SocioConMembresia[]> {
    try {
      const res = await api.get<ApiResponse<SocioConMembresia[]>>('/Membresias/socios');
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al obtener los socios matriculados.');
      }
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener los socios matriculados.';
      throw new Error(errMsg);
    }
  },

  async getFormasPago(): Promise<FormaPago[]> {
    try {
      const res = await api.get<ApiResponse<FormaPago[]>>('/Membresias/formas-pago');
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al obtener las formas de pago.');
      }
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener las formas de pago.';
      throw new Error(errMsg);
    }
  },

  async registrarSocioConMembresia(socio: RegistrarSocioRequest): Promise<boolean> {
    try {
      const res = await api.post<ApiResponse<boolean>>('/Membresias/socios/registrar', socio);
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al registrar el socio con su membresía.');
      }
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al registrar el socio con su membresía.';
      throw new Error(errMsg);
    }
  },

  async getColaboradores(): Promise<Colaborador[]> {
    try {
      const res = await api.get<ApiResponse<Colaborador[]>>('/Colaboradores');
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al obtener la lista de colaboradores.');
      }
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener la lista de colaboradores.';
      throw new Error(errMsg);
    }
  },

  async registrarColaborador(colaborador: RegistrarColaboradorRequest): Promise<boolean> {
    try {
      const res = await api.post<ApiResponse<boolean>>('/Colaboradores/registrar', colaborador);
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al registrar el colaborador.');
      }
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al registrar el colaborador.';
      throw new Error(errMsg);
    }
  },

  async actualizarColaborador(id: number, colaborador: ActualizarColaboradorRequest): Promise<boolean> {
    try {
      const res = await api.put<ApiResponse<boolean>>(`/Colaboradores/${id}`, colaborador);
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al actualizar el colaborador.');
      }
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al actualizar el colaborador.';
      throw new Error(errMsg);
    }
  },

  async eliminarColaborador(id: number): Promise<boolean> {
    try {
      const res = await api.delete<ApiResponse<boolean>>(`/Colaboradores/${id}`);
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al eliminar el colaborador.');
      }
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al eliminar el colaborador.';
      throw new Error(errMsg);
    }
  },

  async getSucursales(): Promise<Sucursal[]> {
    try {
      const res = await api.get<ApiResponse<Sucursal[]>>('/Sucursales');
      if (!res.isSuccess) {
        throw new Error(res.message || 'Error al obtener la lista de sucursales.');
      }
      return res.data;
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Error al obtener la lista de sucursales.';
      throw new Error(errMsg);
    }
  },

  // ─── MEMBRESÍAS: Operaciones Avanzadas ──────────────────────────────────

  async renovarMembresia(req: RenovarMembresiaRequest): Promise<boolean> {
    try {
      const res = await api.post<ApiResponse<boolean>>('/Membresias/socios/renovar', req);
      if (!res.isSuccess) throw new Error(res.message || 'Error al renovar la membresía.');
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al renovar la membresía.');
    }
  },

  async congelarMembresia(req: CongelarMembresiaRequest): Promise<boolean> {
    try {
      const res = await api.post<ApiResponse<boolean>>('/Membresias/socios/congelar', req);
      if (!res.isSuccess) throw new Error(res.message || 'Error al congelar la membresía.');
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al congelar la membresía.');
    }
  },

  async descongelarMembresia(idSocio: number): Promise<boolean> {
    try {
      const res = await api.post<ApiResponse<boolean>>(`/Membresias/socios/descongelar/${idSocio}`, {});
      if (!res.isSuccess) throw new Error(res.message || 'Error al descongelar la membresía.');
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al descongelar la membresía.');
    }
  },

  async cambiarPlan(req: CambiarPlanRequest): Promise<boolean> {
    try {
      const res = await api.post<ApiResponse<boolean>>('/Membresias/socios/cambiar-plan', req);
      if (!res.isSuccess) throw new Error(res.message || 'Error al cambiar el plan.');
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al cambiar el plan.');
    }
  },

  async transferirMembresia(idSocioOrigen: number, idSocioDestino: number): Promise<boolean> {
    try {
      const res = await api.post<ApiResponse<boolean>>('/Membresias/socios/transferir', { idSocioOrigen, idSocioDestino });
      if (!res.isSuccess) throw new Error(res.message || 'Error al transferir la membresía.');
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al transferir la membresía.');
    }
  },

  async cancelarMembresia(idSocio: number, motivo: string): Promise<boolean> {
    try {
      const res = await api.post<ApiResponse<boolean>>('/Membresias/socios/cancelar', { idSocio, motivo });
      if (!res.isSuccess) throw new Error(res.message || 'Error al cancelar la membresía.');
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al cancelar la membresía.');
    }
  },

  async getHistorialFinanciero(idSocio: number): Promise<SocioHistorialFinanciero[]> {
    try {
      const res = await api.get<ApiResponse<SocioHistorialFinanciero[]>>(`/Membresias/socios/${idSocio}/historial-financiero`);
      if (!res.isSuccess) throw new Error(res.message || 'Error al obtener el historial financiero.');
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al obtener el historial financiero.');
    }
  },

  async getMembresiasPorVencer(): Promise<MembresiasPorVencer> {
    try {
      const res = await api.get<ApiResponse<MembresiasPorVencer>>('/Membresias/socios/por-vencer');
      if (!res.isSuccess) throw new Error(res.message || 'Error al obtener membresías por vencer.');
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al obtener membresías por vencer.');
    }
  },

  // ─── CAJA: Control de Turnos ────────────────────────────────────────────

  async getCajaSesionActiva(): Promise<CajaSesionActiva | null> {
    try {
      const res = await api.get<ApiResponse<CajaSesionActiva | null>>('/Caja/sesion-activa');
      if (!res.isSuccess) throw new Error(res.message || 'Error al consultar sesión de caja.');
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al consultar sesión de caja.');
    }
  },

  async abrirCaja(montoApertura: number, comentario?: string): Promise<number> {
    try {
      const res = await api.post<ApiResponse<number>>('/Caja/apertura', { montoApertura, comentario });
      if (!res.isSuccess) throw new Error(res.message || 'Error al abrir la caja.');
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al abrir la caja.');
    }
  },

  async getCajaBalance(idSesionCaja: number): Promise<CajaBalance> {
    try {
      const res = await api.get<ApiResponse<CajaBalance>>(`/Caja/balance/${idSesionCaja}`);
      if (!res.isSuccess) throw new Error(res.message || 'Error al obtener el balance de caja.');
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al obtener el balance de caja.');
    }
  },

  async cerrarCaja(idSesionCaja: number, montoCierreReal: number, comentario?: string): Promise<boolean> {
    try {
      const res = await api.post<ApiResponse<boolean>>('/Caja/cierre', { idSesionCaja, montoCierreReal, comentario });
      if (!res.isSuccess) throw new Error(res.message || 'Error al cerrar la caja.');
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al cerrar la caja.');
    }
  },

  // ─── PORTAL DEL SOCIO ────────────────────────────────────────────────────

  async getSocioStatusSuscripcion(idSocio: number): Promise<SocioConMembresia> {
    try {
      const res = await api.get<ApiResponse<SocioConMembresia>>(`/SocioPortal/${idSocio}/status-suscripcion`);
      if (!res.isSuccess) throw new Error(res.message || 'Error al obtener estado de suscripción.');
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al obtener estado de suscripción.');
    }
  },

  async getSocioAsistencias(idSocio: number): Promise<Asistencia[]> {
    try {
      const res = await api.get<ApiResponse<Asistencia[]>>(`/SocioPortal/${idSocio}/asistencias`);
      if (!res.isSuccess) throw new Error(res.message || 'Error al obtener asistencias.');
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al obtener asistencias.');
    }
  },

  async getEspecialistas(): Promise<Colaborador[]> {
    try {
      const res = await api.get<ApiResponse<Colaborador[]>>('/SocioPortal/especialistas');
      if (!res.isSuccess) throw new Error(res.message || 'Error al obtener especialistas.');
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al obtener especialistas.');
    }
  },

  async getSocioCitas(idSocio: number): Promise<Cita[]> {
    try {
      const res = await api.get<ApiResponse<Cita[]>>(`/SocioPortal/${idSocio}/citas`);
      if (!res.isSuccess) throw new Error(res.message || 'Error al obtener citas.');
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al obtener citas.');
    }
  },

  async agendarCita(dto: { idSocio: number; idEspecialista: number; fechaHora: string; tipoCita: string; notas?: string }): Promise<boolean> {
    try {
      const res = await api.post<ApiResponse<boolean>>('/SocioPortal/citas', dto);
      if (!res.isSuccess) throw new Error(res.message || 'Error al agendar cita.');
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al agendar cita.');
    }
  },

  async cancelarCita(idCita: number): Promise<boolean> {
    try {
      const res = await api.post<ApiResponse<boolean>>(`/SocioPortal/citas/cancelar/${idCita}`);
      if (!res.isSuccess) throw new Error(res.message || 'Error al cancelar cita.');
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al cancelar cita.');
    }
  },

  async getSocioPlanAlimentario(idSocio: number): Promise<PlanAlimentario | null> {
    try {
      const res = await api.get<ApiResponse<PlanAlimentario | null>>(`/SocioPortal/${idSocio}/nutricion-plan`);
      if (!res.isSuccess) throw new Error(res.message || 'Error al obtener plan alimentario.');
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al obtener plan alimentario.');
    }
  },

  async getSocioEvaluacionesAntropometricas(idSocio: number): Promise<EvaluacionAntropometrica[]> {
    try {
      const res = await api.get<ApiResponse<EvaluacionAntropometrica[]>>(`/SocioPortal/${idSocio}/nutricion-evaluaciones`);
      if (!res.isSuccess) throw new Error(res.message || 'Error al obtener evaluaciones antropométricas.');
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al obtener evaluaciones antropométricas.');
    }
  },

  async getSocioRutinaActiva(idSocio: number): Promise<Rutina | null> {
    try {
      const res = await api.get<ApiResponse<Rutina | null>>(`/SocioPortal/${idSocio}/entrenamiento-rutinas`);
      if (!res.isSuccess) throw new Error(res.message || 'Error al obtener rutina de entrenamiento.');
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Error al obtener rutina de entrenamiento.');
    }
  },
};

