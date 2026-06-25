import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';

const HUB_URL = 'http://localhost:5167/hubs/reservas';

export interface SeatReservadoPayload {
  idClase: number;
  asientoId: number;
  nombreSocio: string;
}

export interface AsistenciaActualizadaPayload {
  idClase: number;
  idReserva: number;
  asistio: boolean;
}

interface UseReservasHubOptions {
  idClase: number | null;
  onSeatReservado?: (payload: SeatReservadoPayload) => void;
  onAsistenciaActualizada?: (payload: AsistenciaActualizadaPayload) => void;
}

/**
 * Hook que gestiona la conexión WebSocket con el hub de reservas de SignalR.
 *
 * Flujo:
 * 1. Conecta al hub cuando el componente monta.
 * 2. Se une al grupo "clase-{idClase}" para recibir solo eventos de esa clase.
 * 3. Registra callbacks para los eventos "SeatReservado" y "AsistenciaActualizada".
 * 4. Si el idClase cambia, sale del grupo anterior y se une al nuevo.
 * 5. Al desmontar, sale del grupo y cierra la conexión limpiamente.
 *
 * @param options - idClase, callbacks onSeatReservado, onAsistenciaActualizada
 */
export const useReservasHub = ({
  idClase,
  onSeatReservado,
  onAsistenciaActualizada,
}: UseReservasHubOptions) => {
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const prevClaseIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Si no hay una clase seleccionada, no iniciamos conexión SignalR ya que no hay asientos que monitorear
    if (idClase === null) {
      return;
    }

    // Crear la conexión si aún no existe
    if (!connectionRef.current) {
      connectionRef.current = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, {
          skipNegotiation: false,
          transport: signalR.HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000]) // ms entre reintentos
        .configureLogging(signalR.LogLevel.Warning)
        .build();
    }

    const connection = connectionRef.current;

    // Registrar handlers de eventos del servidor
    const handleSeatReservado = (payload: SeatReservadoPayload) => {
      onSeatReservado?.(payload);
    };

    const handleAsistenciaActualizada = (payload: AsistenciaActualizadaPayload) => {
      onAsistenciaActualizada?.(payload);
    };

    const startConnection = async () => {
      try {
        if (connection.state === signalR.HubConnectionState.Disconnected) {
          await connection.start();
        }

        // Registrar los listeners (off primero para evitar duplicados en hot-reload)
        connection.off('SeatReservado');
        connection.off('AsistenciaActualizada');
        connection.on('SeatReservado', handleSeatReservado);
        connection.on('AsistenciaActualizada', handleAsistenciaActualizada);

        // Unirse al grupo de la nueva clase
        if (idClase !== null) {
          // Salir del grupo anterior si cambió
          if (prevClaseIdRef.current !== null && prevClaseIdRef.current !== idClase) {
            await connection.invoke('SalirDeClase', prevClaseIdRef.current);
          }
          await connection.invoke('UnirseAClase', idClase);
          prevClaseIdRef.current = idClase;
        }
      } catch (err: any) {
        // Silenciar errores de aborto causados por el desmontado inmediato en React 18 Strict Mode
        if (err.name === 'AbortError' || err.message?.includes('stopped during negotiation')) {
          return;
        }
        console.error('[SignalR] Error al conectar al hub de reservas:', err);
      }
    };

    startConnection();

    // Cleanup: salir del grupo y remover listeners al desmontar o cambiar idClase
    return () => {
      const cleanUp = async () => {
        if (
          connection.state === signalR.HubConnectionState.Connected &&
          prevClaseIdRef.current !== null
        ) {
          try {
            await connection.invoke('SalirDeClase', prevClaseIdRef.current);
          } catch {
            // Ignorar errores de cleanup silenciosamente
          }
        }
        connection.off('SeatReservado', handleSeatReservado);
        connection.off('AsistenciaActualizada', handleAsistenciaActualizada);
      };
      cleanUp();
    };
  }, [idClase]);

  // Cerrar la conexión cuando el componente se desmonta completamente
  useEffect(() => {
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
      }
    };
  }, []);
};
