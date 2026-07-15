import React, { useState } from 'react';

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface TransaccionCaja {
  idVenta: number;
  fechaVenta: string;
  total: number;
  formaPago: string;
  idSesionCaja: number | null;
  idVendedor: number;
  nombreVendedor: string;
  idSocio: number | null;
  nombreSocio: string;
  tipoTransaccion: string;
  estadoContrato: string | null;
}

// ─── Props ─────────────────────────────────────────────────────────────────────
interface CashSessionTableProps {
  transactions: TransaccionCaja[];
  loading?: boolean;
  emptyMessage?: string;
  pageSize?: number;
}

// ─── Badge: Tipo ───────────────────────────────────────────────────────────────
const TipoBadge: React.FC<{ tipo: string; idVenta: number; estado: string | null }> = ({ tipo, idVenta, estado }) => {
  const isMembresia = tipo === 'Membresía' || idVenta < 0;
  const isParcial = estado === 'Parcial';
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 6,
    fontSize: 10, fontWeight: 800,
    textTransform: 'uppercase', whiteSpace: 'nowrap',
  };
  if (isMembresia) return (
    <span style={{
      ...base,
      background: isParcial ? 'rgba(234,179,8,0.15)' : 'rgba(99,102,241,0.15)',
      border: `1px solid ${isParcial ? 'rgba(234,179,8,0.4)' : 'rgba(99,102,241,0.4)'}`,
      color: isParcial ? '#fde68a' : '#a5b4fc',
    }}>
      🏋️ Membresía{isParcial ? ' · Adelanto' : ''}
    </span>
  );
  return (
    <span style={{ ...base, background: 'rgba(20,184,166,0.12)', border: '1px solid rgba(20,184,166,0.35)', color: '#5eead4' }}>
      🛒 Bar Fit / Clase
    </span>
  );
};

// ─── Badge: Forma de Pago ──────────────────────────────────────────────────────
const FormaPagoBadge: React.FC<{ forma: string }> = ({ forma }) => {
  const map: Record<string, [string, string]> = {
    Efectivo:      ['rgba(34,197,94,0.12)',   '#86efac'],
    Yape:          ['rgba(139,92,246,0.12)',  '#c4b5fd'],
    Plin:          ['rgba(59,130,246,0.12)',  '#93c5fd'],
    Transferencia: ['rgba(251,146,60,0.12)',  '#fdba74'],
    Tarjeta:       ['rgba(20,184,166,0.12)',  '#5eead4'],
    Mixto:         ['rgba(234,179,8,0.12)',   '#fde68a'],
  };
  const [bg, color] = map[forma] ?? ['rgba(255,255,255,0.06)', '#cbd5e1'];
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700,
      textTransform: 'uppercase', background: bg, color,
      border: `1px solid ${color}30`,
    }}>{forma}</span>
  );
};

// ─── Main ──────────────────────────────────────────────────────────────────────
export const CashSessionTable: React.FC<CashSessionTableProps> = ({
  transactions, loading = false,
  emptyMessage = 'No hay transacciones para el rango seleccionado.',
  pageSize = 10,
}) => {
  const [page, setPage] = useState(1);
  React.useEffect(() => { setPage(1); }, [transactions.length]);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b', fontSize: 12, fontWeight: 700 }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>⏳</div>Cargando transacciones...
    </div>
  );

  if (transactions.length === 0) return (
    <div style={{
      textAlign: 'center', padding: '48px 24px',
      border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20,
      background: 'rgba(15,15,30,0.3)', color: '#64748b', fontSize: 13, fontWeight: 600,
    }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>{emptyMessage}
    </div>
  );

  const totalGeneral    = transactions.reduce((s, t) => s + t.total, 0);
  const totalMembresias = transactions.filter(t => t.tipoTransaccion === 'Membresía' || t.idVenta < 0).reduce((s, t) => s + t.total, 0);
  const totalBarFit     = transactions.filter(t => t.tipoTransaccion !== 'Membresía' && t.idVenta > 0).reduce((s, t) => s + t.total, 0);
  const totalAdelantos  = transactions.filter(t => t.estadoContrato === 'Parcial').reduce((s, t) => s + t.total, 0);

  const totalPages = Math.ceil(transactions.length / pageSize);
  const paginated  = transactions.slice((page - 1) * pageSize, page * pageSize);

  const card = (bg: string, border: string): React.CSSProperties => ({
    background: bg, border: `1px solid ${border}`, borderRadius: 16,
    padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 4,
  });
  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    padding: '5px 14px', borderRadius: 8,
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.04)', color: '#94a3b8',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1, fontSize: 11, fontWeight: 700,
  });


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 12 }}>
        <div style={card('rgba(34,197,94,0.08)', 'rgba(34,197,94,0.2)')}>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#4ade80', textTransform: 'uppercase', letterSpacing: '0.08em' }}>💰 Total Recaudado</span>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>S/ {totalGeneral.toFixed(2)}</span>
          <span style={{ fontSize: 10, color: '#64748b' }}>{transactions.length} transacciones</span>
        </div>
        <div style={card('rgba(99,102,241,0.08)', 'rgba(99,102,241,0.2)')}>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>🏋️ Membresías</span>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>S/ {totalMembresias.toFixed(2)}</span>
          <span style={{ fontSize: 10, color: '#64748b' }}>{transactions.filter(t => t.tipoTransaccion === 'Membresía').length} contratos</span>
        </div>
        <div style={card('rgba(20,184,166,0.08)', 'rgba(20,184,166,0.2)')}>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#2dd4bf', textTransform: 'uppercase', letterSpacing: '0.08em' }}>🛒 Bar Fit / Clases</span>
          <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>S/ {totalBarFit.toFixed(2)}</span>
          <span style={{ fontSize: 10, color: '#64748b' }}>{transactions.filter(t => t.tipoTransaccion !== 'Membresía').length} ventas</span>
        </div>
        {totalAdelantos > 0 && (
          <div style={card('rgba(234,179,8,0.08)', 'rgba(234,179,8,0.25)')}>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.08em' }}>⚠️ Adelantos</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>S/ {totalAdelantos.toFixed(2)}</span>
            <span style={{ fontSize: 10, color: '#64748b' }}>contratos parciales</span>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden', background: 'rgba(10,10,20,0.4)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
                {['ID', 'Tipo', 'Fecha / Hora', 'Cliente / Plan', 'Forma de Pago', 'Cajero', 'Monto'].map((h, i) => (
                  <th key={h} style={{
                    padding: '12px 14px', fontSize: 10, fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.08em', color: '#475569', whiteSpace: 'nowrap',
                    ...(i === 6 ? { textAlign: 'right' } : {}),
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((t, i) => (
                <tr key={`${t.idVenta}-${i}`}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: '#475569', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {t.tipoTransaccion === 'Membresía'
                      ? `#MB-${String(Math.abs(t.idVenta)).padStart(5, '0')}`
                      : `#VP-${String(t.idVenta).padStart(5, '0')}`}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <TipoBadge tipo={t.tipoTransaccion} idVenta={t.idVenta} estado={t.estadoContrato} />
                  </td>
                  <td style={{ padding: '12px 14px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                    {new Date(t.fechaVenta).toLocaleDateString('es-PE', {
                      day: '2-digit', month: '2-digit', year: 'numeric',
                      hour: '2-digit', minute: '2-digit', hour12: true,
                    })}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#f1f5f9', fontWeight: 700, maxWidth: 220 }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.nombreSocio}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <FormaPagoBadge forma={t.formaPago} />
                  </td>
                  <td style={{ padding: '12px 14px', color: '#64748b', whiteSpace: 'nowrap' }}>{t.nombreVendedor}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 900, color: '#4ade80', fontSize: 14, whiteSpace: 'nowrap' }}>
                    S/ {t.total.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 16px', background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12,
          fontSize: 12, fontWeight: 600, color: '#94a3b8',
        }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={btnStyle(page === 1)}>← Anterior</button>
          <span>Página <strong style={{ color: '#fff' }}>{page}</strong> de {totalPages} · {transactions.length} transacciones</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={btnStyle(page === totalPages)}>Siguiente →</button>
        </div>
      )}
    </div>
  );
};
