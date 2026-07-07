import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

interface ToastProps {
  mensaje: { tipo: 'success' | 'error'; texto: string } | null;
  onClose?: () => void;
  duration?: number;
}

/**
 * Toast: Componente de notificación emergente premium para feedback del sistema.
 * Utiliza Portals para asegurar que la posición sea siempre relativa al viewport.
 */
export const Toast: React.FC<ToastProps> = ({ mensaje, onClose, duration = 4000 }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (mensaje) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        // Pequeño delay para la animación de salida antes de limpiar el estado
        const animationTimer = setTimeout(() => {
          if (onClose) onClose();
        }, 300);
        return () => clearTimeout(animationTimer);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [mensaje, duration, onClose]);

  if (!mensaje) return null;

  return ReactDOM.createPortal(
    <div
      data-testid="toast-notification"
      className={`
        fixed top-8 right-8 z-[9999] 
        p-4 rounded-2xl shadow-premium-lg border
        flex items-center gap-3 
        bg-[#110f22]/95 backdrop-blur-md border-white/10 transition-all duration-500 ease-out transform
        font-black text-[10px] uppercase tracking-widest
        ${visible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-[120%] opacity-0 scale-90'}
        ${mensaje.tipo === 'success' ? 'text-accent-cyan' : 'text-rose-400'}
      `}
    >
      <span className={`
        inline-flex items-center font-black uppercase tracking-widest border rounded-full px-3 py-1 text-[10px]
        ${mensaje.tipo === 'success' 
          ? 'bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan' 
          : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}
      `}>
        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${mensaje.tipo === 'success' ? 'bg-accent-cyan' : 'bg-rose-500'}`} />
        {mensaje.texto}
      </span>
    </div>,
    document.body
  );
};
export default Toast;
