import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import type { SocioConMembresia, SocioHistorialFinanciero } from '../../../../data/apiService';
import { apiService } from '../../../../data/apiService';

interface SocioDetailCardProps {
  socio: SocioConMembresia;
  planes: { id: number; nombre: string; precio: number; duracionMeses: number }[];
  onClose: () => void;
  onRefresh: () => void;
}

const ESTADOS_SOCIO: Record<string, { color: string; bg: string; label: string }> = {
  Activo:      { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',    label: 'Activo' },
  Congelado:   { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)',   label: 'Congelado' },
  Suspendido:  { color: '#f97316', bg: 'rgba(249,115,22,0.12)',   label: 'Suspendido' },
  Vencido:     { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',    label: 'Vencido' },
  Pendiente:   { color: '#facc15', bg: 'rgba(250,204,21,0.12)',   label: 'Pendiente' },
  Invitado:    { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)',  label: 'Invitado' },
};

type TabType = 'membresia' | 'historial' | 'acciones';
type AccionType = 'renovar' | 'congelar' | 'cambiar' | 'transferir' | 'cancelar' | null;

export const SocioDetailCard: React.FC<SocioDetailCardProps> = ({ socio, planes, onClose, onRefresh }) => {
  const [activeTab, setActiveTab] = useState<TabType>('membresia');
  const [historial, setHistorial] = useState<SocioHistorialFinanciero[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [accionActiva, setAccionActiva] = useState<AccionType>(null);
  
  // Catalogo de formas de pago
  const [formasPago, setFormasPago] = useState<{ id: number; nombre: string }[]>([]);

  // Renovar/Cambiar Plan states
  const matchedPlan = planes.find(p => p.nombre.toLowerCase() === socio.nombrePlan?.toLowerCase());
  const [selectedPlanId, setSelectedPlanId] = useState(matchedPlan?.id || 0);
  const [precioOriginal, setPrecioOriginal] = useState(matchedPlan?.precio || socio.montoPagado || 0);
  const [precioPagado, setPrecioPagado] = useState(matchedPlan?.precio || socio.montoPagado || 0);
  const [descuentoPct, setDescuentoPct] = useState(0);
  const [descuentoAuth, setDescuentoAuth] = useState('');
  const [selectedFormaPagoId, setSelectedFormaPagoId] = useState(1);

  // Congelar states
  const [fechaInicioCongelacion, setFechaInicioCongelacion] = useState('');
  const [fechaFinCongelacion, setFechaFinCongelacion] = useState('');
  const [motivoCongelacion, setMotivoCongelacion] = useState('');
  const [autorizadoPor, setAutorizadoPor] = useState('');

  // Transferir states
  const [dniDestino, setDniDestino] = useState('');
  const [idSocioDestino, setIdSocioDestino] = useState(0);
  const [nombreDestino, setNombreDestino] = useState('');

  // Cancelar states
  const [motivoCancelacion, setMotivoCancelacion] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const estadoInfo = ESTADOS_SOCIO[socio.estadoSocio] || ESTADOS_SOCIO['Activo'];

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    apiService.getFormasPago()
      .then(data => {
        setFormasPago(data);
        if (data.length > 0) {
          setSelectedFormaPagoId(data[0].id);
        }
      })
      .catch(() => showToast('Error al cargar formas de pago.', 'error'));
  }, []);

  useEffect(() => {
    if (activeTab === 'historial' && historial.length === 0) {
      setLoadingHistorial(true);
      apiService.getHistorialFinanciero(socio.idSocio)
        .then(data => setHistorial(data))
        .catch(() => showToast('Error al cargar el historial financiero.', 'error'))
        .finally(() => setLoadingHistorial(false));
    }
  }, [activeTab]);

  // Auto-calcular precio con descuento
  const precioConDescuento = parseFloat((precioOriginal * (1 - descuentoPct / 100)).toFixed(2));
  useEffect(() => {
    setPrecioPagado(precioConDescuento);
  }, [precioOriginal, descuentoPct]);

  // Derivadas para adelanto
  const isAdelanto = selectedPlanId > 0 && precioPagado > 0 && precioPagado < precioConDescuento;
  const isExcedido = precioPagado > precioConDescuento;
  const saldoPendiente = parseFloat((precioConDescuento - precioPagado).toFixed(2));
  const fechaLimite15 = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
  })();

  const handleRenovar = async () => {
    const plan = planes.find(p => p.id === selectedPlanId);
    const precioAcordado = (plan?.precio ?? precioOriginal) * (1 - descuentoPct / 100);
    if (precioPagado > precioAcordado) {
      showToast('El monto a pagar no puede superar el precio final con descuento.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await apiService.renovarMembresia({
        idSocio: socio.idSocio, idPlanMembresia: selectedPlanId,
        precioOriginal: plan?.precio ?? precioOriginal, precioPagado, porcentajeDescuento: descuentoPct,
        descuentoAutorizadoPor: descuentoAuth || undefined, idFormaPago: selectedFormaPagoId,
      });
      showToast('✅ Membresía renovada con éxito.', 'success');
      setAccionActiva(null);
      onRefresh();
    } catch (e: any) { showToast(e.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const handleCongelar = async () => {
    setSubmitting(true);
    try {
      await apiService.congelarMembresia({
        idSocio: socio.idSocio, fechaInicio: fechaInicioCongelacion,
        fechaFin: fechaFinCongelacion, motivo: motivoCongelacion, autorizadoPor,
      });
      showToast('❄️ Membresía congelada con éxito.', 'success');
      setAccionActiva(null);
      onRefresh();
    } catch (e: any) { showToast(e.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDescongelar = async () => {
    setSubmitting(true);
    try {
      await apiService.descongelarMembresia(socio.idSocio);
      showToast('✅ Membresía reactivada con éxito.', 'success');
      onRefresh();
    } catch (e: any) { showToast(e.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const handleCambiarPlan = async () => {
    const plan = planes.find(p => p.id === selectedPlanId);
    const precioAcordado = (plan?.precio ?? precioOriginal) * (1 - descuentoPct / 100);
    if (precioPagado > precioAcordado) {
      showToast('El monto a pagar no puede superar el precio final con descuento.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await apiService.cambiarPlan({
        idSocio: socio.idSocio, idPlanMembresia: selectedPlanId,
        precioOriginal: plan?.precio ?? precioOriginal, precioPagado, porcentajeDescuento: descuentoPct,
        descuentoAutorizadoPor: descuentoAuth || undefined, idFormaPago: selectedFormaPagoId,
      });
      showToast('🔄 Plan de membresía cambiado con éxito.', 'success');
      setAccionActiva(null);
      onRefresh();
    } catch (e: any) { showToast(e.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const handleBuscarDestino = async () => {
    if (!dniDestino.trim()) return;
    try {
      const data = await apiService.checkDni(dniDestino.trim());
      setIdSocioDestino(data.idPersona); // Buscamos por persona, backend resuelve a socio
      setNombreDestino(`${data.nombre} ${data.apellidoPaterno}`);
      showToast(`Destinatario encontrado: ${data.nombre} ${data.apellidoPaterno}`, 'success');
    } catch { showToast('DNI no encontrado en el sistema.', 'error'); }
  };

  const handleTransferir = async () => {
    if (!idSocioDestino) { showToast('Busca y selecciona el destinatario primero.', 'error'); return; }
    setSubmitting(true);
    try {
      await apiService.transferirMembresia(socio.idSocio, idSocioDestino);
      showToast('🔁 Membresía transferida con éxito.', 'success');
      setAccionActiva(null);
      onRefresh();
    } catch (e: any) { showToast(e.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const handleCancelar = async () => {
    if (!motivoCancelacion.trim()) { showToast('Ingresa el motivo de cancelación.', 'error'); return; }
    setSubmitting(true);
    try {
      await apiService.cancelarMembresia(socio.idSocio, motivoCancelacion);
      showToast('🚫 Membresía cancelada.', 'success');
      setAccionActiva(null);
      onRefresh();
    } catch (e: any) { showToast(e.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const nombreCompleto = `${socio.nombre} ${socio.apellidoPaterno} ${socio.apellidoMaterno || ''}`.trim();

  return ReactDOM.createPortal(
    <>
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      }} onClick={onClose}>
        <div style={{
          background: '#1a1f2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px',
          width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', padding: '32px',
          boxShadow: '0 25px 80px rgba(0,0,0,0.6)', position: 'relative',
        }} onClick={e => e.stopPropagation()}>

          {/* Botón cerrar */}
          <button onClick={onClose} style={{
            position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', width: '36px', height: '36px',
            cursor: 'pointer', color: '#9ca3af', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>

          {/* Header del socio */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '700', color: '#fff', flexShrink: 0,
            }}>{socio.nombre?.[0]?.toUpperCase() ?? '?'}</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#f1f5f9' }}>{nombreCompleto}</h2>
              <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: '13px' }}>
                DNI: {socio.numeroDocumento} · Tel: {socio.telefono || '—'} · {socio.correo || '—'}
              </p>
            </div>
            <span style={{
              padding: '6px 16px', borderRadius: '999px', fontSize: '12px', fontWeight: '700',
              color: estadoInfo.color, background: estadoInfo.bg, border: `1px solid ${estadoInfo.color}40`,
            }}>{estadoInfo.label}</span>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px' }}>
            {(['membresia', 'historial', 'acciones'] as TabType[]).map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px', transition: 'all 0.2s',
                background: activeTab === tab ? 'linear-gradient(135deg, #6366f1, #a855f7)' : 'transparent',
                color: activeTab === tab ? '#fff' : '#9ca3af',
              }}>
                {tab === 'membresia' ? '🏋️ Membresía' : tab === 'historial' ? '📋 Historial' : '⚡ Acciones'}
              </button>
            ))}
          </div>

          {/* TAB: MEMBRESÍA */}
          {activeTab === 'membresia' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Plan', value: socio.nombrePlan || '—' },
                { label: 'Duración', value: socio.duracionMeses ? `${socio.duracionMeses} mes(es)` : '—' },
                { label: 'Inicio Membresía', value: socio.fechaInicioMembresia ? new Date(socio.fechaInicioMembresia).toLocaleDateString('es-PE') : '—' },
                { label: 'Vence', value: socio.fechaFinMembresia ? new Date(socio.fechaFinMembresia).toLocaleDateString('es-PE') : '—' },
                { label: 'Forma de Pago', value: socio.formaPago || '—' },
                { label: 'Precio Acordado', value: socio.precioAcordado != null ? `S/ ${socio.precioAcordado.toFixed(2)}` : '—' },
                { label: 'Monto Pagado', value: socio.montoPagado != null ? `S/ ${socio.montoPagado.toFixed(2)}` : '—' },
                { label: 'Saldo Pendiente (Deuda)', value: socio.montoDeuda != null && socio.montoDeuda > 0 ? `S/ ${socio.montoDeuda.toFixed(2)}` : 'S/ 0.00' },
                { label: 'Límite de Pago', value: socio.montoDeuda != null && socio.montoDeuda > 0 && socio.fechaLimitePago ? new Date(socio.fechaLimitePago).toLocaleDateString('es-PE') : '—' },
                { label: 'Días Restantes para Pagar', value: socio.montoDeuda != null && socio.montoDeuda > 0 && socio.diasRestantesPago != null ? (socio.diasRestantesPago >= 0 ? `${socio.diasRestantesPago} día(s)` : `VENCIDO (hace ${Math.abs(socio.diasRestantesPago)} días)`) : '—' },
                { label: 'Estado Contrato', value: socio.estadoContrato || '—' },
                { label: 'Estado Membresía', value: socio.estadoMembresia || '—' },
              ].map(item => (
                <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                  <p style={{ margin: '4px 0 0', fontSize: '15px', fontWeight: '600', color: '#e2e8f0' }}>{item.value}</p>
                </div>
              ))}
              {/* Acciones Rápidas */}
              {socio.estadoSocio === 'Congelado' && (
                <div style={{ gridColumn: '1/-1', paddingTop: '8px' }}>
                  <button onClick={handleDescongelar} disabled={submitting} style={{
                    width: '100%', padding: '12px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff',
                    border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px',
                  }}>🔄 Descongelar Membresía Ahora</button>
                </div>
              )}
            </div>
          )}

          {/* TAB: HISTORIAL FINANCIERO */}
          {activeTab === 'historial' && (
            <div>
              {loadingHistorial ? (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>Cargando historial...</div>
              ) : historial.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>Sin historial financiero registrado.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {historial.map(h => (
                    <div key={h.idContrato} style={{
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '12px', padding: '14px 18px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px',
                    }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: '#f1f5f9' }}>{h.nombrePlan}</p>
                        <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#6b7280' }}>
                          {new Date(h.fechaVenta).toLocaleDateString('es-PE')} · {h.formaPago} · Por: {h.nombreVendedor}
                        </p>
                        {h.porcentajeDescuento > 0 && (
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#a78bfa' }}>
                            Descuento {h.porcentajeDescuento}% – Auto: {h.descuentoAutorizadoPor || '—'}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#22c55e' }}>S/ {h.montoPagado.toFixed(2)}</p>
                        {h.precioOriginal !== h.montoPagado && (
                          <p style={{ margin: 0, fontSize: '11px', color: '#6b7280', textDecoration: 'line-through' }}>S/ {h.precioOriginal.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: ACCIONES RÁPIDAS */}
          {activeTab === 'acciones' && !accionActiva && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {([
                { key: 'renovar', icon: '🔄', label: 'Renovar Membresía', color: '#6366f1' },
                { key: 'congelar', icon: '❄️', label: 'Congelar Membresía', color: '#60a5fa' },
                { key: 'cambiar', icon: '📋', label: 'Cambiar de Plan', color: '#a855f7' },
                { key: 'transferir', icon: '🔁', label: 'Transferir Membresía', color: '#f59e0b' },
                { key: 'cancelar', icon: '🚫', label: 'Cancelar Membresía', color: '#ef4444' },
              ] as { key: AccionType; icon: string; label: string; color: string }[]).map(accion => (
                <button key={accion.key!} onClick={() => setAccionActiva(accion.key)} style={{
                  padding: '18px', background: `${accion.color}12`, border: `1px solid ${accion.color}40`,
                  borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{accion.icon}</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: accion.color }}>{accion.label}</div>
                </button>
              ))}
            </div>
          )}

          {/* Formularios de Acciones */}
          {activeTab === 'acciones' && accionActiva && (
            <div>
              <button onClick={() => setAccionActiva(null)} style={{
                background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px',
              }}>← Volver a acciones</button>

              {/* ─── RENOVAR ─── */}
              {(accionActiva === 'renovar' || accionActiva === 'cambiar') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '16px' }}>
                    {accionActiva === 'renovar' ? '🔄 Renovar Membresía' : '📋 Cambiar Plan'}
                  </h3>
                  <div>
                    <label style={labelStyle}>Plan</label>
                    <select value={selectedPlanId} onChange={e => {
                      const pid = Number(e.target.value);
                      setSelectedPlanId(pid);
                      const p = planes.find(x => x.id === pid);
                      if (p) { setPrecioOriginal(p.precio); }
                    }} style={selectStyle}>
                      <option value={0} style={{ background: '#1a1f2e', color: '#f1f5f9' }}>Seleccionar Plan</option>
                      {planes.map(p => (
                        <option key={p.id} value={p.id} style={{ background: '#1a1f2e', color: '#f1f5f9' }}>
                          {p.nombre} – S/ {p.precio} ({p.duracionMeses} mes)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Descuento %</label>
                      <input type="number" min={0} max={100} value={descuentoPct} onChange={e => setDescuentoPct(Number(e.target.value))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Monto a Pagar Hoy (S/)</label>
                      <input type="number" min={0} value={precioPagado} onChange={e => setPrecioPagado(Number(e.target.value))} style={inputStyle} />
                    </div>
                  </div>
                  {descuentoPct > 0 && (
                    <div>
                      <label style={labelStyle}>Descuento autorizado por</label>
                      <input value={descuentoAuth} onChange={e => setDescuentoAuth(e.target.value)} placeholder="Nombre del autorizante" style={inputStyle} />
                    </div>
                  )}
                  {/* Banner de tipo de pago */}
                  {selectedPlanId > 0 && (
                    <div style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: '600',
                      lineHeight: '1.5',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      ...(isExcedido
                        ? { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#fca5a5' }
                        : isAdelanto
                        ? { background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.35)', color: '#fde68a' }
                        : { background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.35)', color: '#86efac' }
                      ),
                    }}>
                      <span style={{ fontSize: '18px', lineHeight: '1.2' }}>
                        {isExcedido ? '🚫' : isAdelanto ? '💰' : '✅'}
                      </span>
                      <div>
                        {isExcedido && (
                          <>
                            <strong>Monto excede el precio final</strong>
                            <div style={{ opacity: 0.85, marginTop: '2px' }}>El monto ingresado (S/ {precioPagado.toFixed(2)}) supera el precio acordado de S/ {precioConDescuento.toFixed(2)}.</div>
                          </>
                        )}
                        {isAdelanto && (
                          <>
                            <strong>⚠️ Pago con adelanto — Contrato parcial</strong>
                            <div style={{ opacity: 0.85, marginTop: '2px' }}>
                              Paga hoy: <strong>S/ {precioPagado.toFixed(2)}</strong> · Saldo pendiente: <strong>S/ {saldoPendiente.toFixed(2)}</strong>
                            </div>
                            <div style={{ opacity: 0.75, marginTop: '3px', fontSize: '11px' }}>
                              📅 Fecha límite para cancelar el saldo: <strong>{fechaLimite15}</strong>
                            </div>
                          </>
                        )}
                        {!isAdelanto && !isExcedido && precioPagado > 0 && (
                          <>
                            <strong>Pago completo</strong>
                            <div style={{ opacity: 0.85, marginTop: '2px' }}>El socio cancela el total de S/ {precioConDescuento.toFixed(2)}.</div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  <div>
                    <label style={labelStyle}>Forma de Pago</label>
                    <select value={selectedFormaPagoId} onChange={e => setSelectedFormaPagoId(Number(e.target.value))} style={selectStyle}>
                      {formasPago.map(f => (
                        <option key={f.id} value={f.id} style={{ background: '#1a1f2e', color: '#f1f5f9' }}>
                          {f.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={accionActiva === 'renovar' ? handleRenovar : handleCambiarPlan}
                    disabled={submitting || !selectedPlanId || isExcedido}
                    style={{
                      ...primaryBtnStyle,
                      ...(isAdelanto ? { background: 'linear-gradient(135deg, #d97706, #b45309)' } : {}),
                    }}
                  >
                    {submitting
                      ? 'Procesando...'
                      : isAdelanto
                      ? `💰 Confirmar Adelanto de S/ ${precioPagado.toFixed(2)}`
                      : accionActiva === 'renovar'
                      ? '✅ Confirmar Renovación'
                      : '✅ Confirmar Cambio de Plan'
                    }
                  </button>
                </div>
              )}

              {/* ─── CONGELAR ─── */}
              {accionActiva === 'congelar' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '16px' }}>❄️ Congelar Membresía</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>Fecha Inicio</label>
                      <input type="date" value={fechaInicioCongelacion} onChange={e => setFechaInicioCongelacion(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Fecha Fin</label>
                      <input type="date" value={fechaFinCongelacion} onChange={e => setFechaFinCongelacion(e.target.value)} style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Motivo</label>
                    <input value={motivoCongelacion} onChange={e => setMotivoCongelacion(e.target.value)} placeholder="Ej: Viaje, lesión, motivos personales..." style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Autorizado por</label>
                    <input value={autorizadoPor} onChange={e => setAutorizadoPor(e.target.value)} placeholder="Nombre del administrador que autoriza" style={inputStyle} />
                  </div>
                  <button onClick={handleCongelar} disabled={submitting} style={{ ...primaryBtnStyle, background: 'linear-gradient(135deg, #60a5fa, #3b82f6)' }}>
                    {submitting ? 'Procesando...' : 'Confirmar Congelamiento'}
                  </button>
                </div>
              )}

              {/* ─── TRANSFERIR ─── */}
              {accionActiva === 'transferir' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '16px' }}>🔁 Transferir Membresía</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>
                    Los días restantes de la membresía de <strong style={{ color: '#f1f5f9' }}>{socio.nombre}</strong> se transferirán al destinatario.
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input value={dniDestino} onChange={e => setDniDestino(e.target.value)} placeholder="DNI del destinatario" style={{ ...inputStyle, flex: 1 }} />
                    <button onClick={handleBuscarDestino} style={{ padding: '0 18px', background: 'rgba(99,102,241,0.2)', border: '1px solid #6366f1', borderRadius: '8px', color: '#6366f1', cursor: 'pointer', fontWeight: '600', whiteSpace: 'nowrap' }}>
                      Buscar
                    </button>
                  </div>
                  {nombreDestino && (
                    <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#22c55e', fontSize: '13px', fontWeight: '600' }}>
                      ✓ Destinatario: {nombreDestino}
                    </div>
                  )}
                  <button onClick={handleTransferir} disabled={submitting || !idSocioDestino} style={{ ...primaryBtnStyle, background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                    {submitting ? 'Transfiriendo...' : 'Confirmar Transferencia'}
                  </button>
                </div>
              )}

              {/* ─── CANCELAR ─── */}
              {accionActiva === 'cancelar' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h3 style={{ margin: 0, color: '#ef4444', fontSize: '16px' }}>🚫 Cancelar Membresía</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>Esta acción cambiará el estado del socio a <strong style={{ color: '#ef4444' }}>Suspendido</strong>. No se eliminarán los datos históricos.</p>
                  <div>
                    <label style={labelStyle}>Motivo de Cancelación</label>
                    <textarea value={motivoCancelacion} onChange={e => setMotivoCancelacion(e.target.value)} rows={3} placeholder="Describe el motivo de la cancelación..." style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }} />
                  </div>
                  <button onClick={handleCancelar} disabled={submitting} style={{ ...primaryBtnStyle, background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                    {submitting ? 'Procesando...' : 'Confirmar Cancelación'}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 10001,
          background: toast.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'success' ? '#22c55e' : '#ef4444'}50`,
          borderRadius: '12px', padding: '14px 20px', color: toast.type === 'success' ? '#22c55e' : '#ef4444',
          fontWeight: '600', fontSize: '14px', backdropFilter: 'blur(8px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>{toast.msg}</div>
      )}
    </>,
    document.body
  );
};

// Helpers de estilos
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px',
  color: '#f1f5f9', fontSize: '14px', boxSizing: 'border-box',
  outline: 'none', fontFamily: 'inherit',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', fontWeight: '600', color: '#9ca3af',
  marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em',
};

const primaryBtnStyle: React.CSSProperties = {
  padding: '13px', background: 'linear-gradient(135deg, #6366f1, #a855f7)',
  color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer',
  fontWeight: '700', fontSize: '14px', width: '100%', transition: 'opacity 0.2s',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  background: '#1a1f2e',
  color: '#f1f5f9',
};
