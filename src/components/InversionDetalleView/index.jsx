"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { inversionesApi, perfilesApi } from "@/lib/api";


import { formatDate, formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  User,
  Calendar,
  Percent,
  Clock,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowUpRight,
  PieChart,
  Briefcase,
  AlertTriangle,
  FileText
} from "lucide-react";
import Link from "next/link";
import styles from "../PrestamoDetalleView/PrestamoDetalleView.module.css";
import { PersonaDetalleView } from "@/components/PersonaDetalleView";
import { Modal } from "@/components/Modal";

export function InversionDetalleView({ id, isModal = false, isOpen = false, onClose }) {
  const [inversion, setInversion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cuentas, setCuentas] = useState([]);
  const [paymentData, setPaymentData] = useState({
    monto_total: '',
    monto_capital: '',
    monto_interes: '',
    cuenta_id: '',
    metodo_pago: 'transferencia',
    notas: ''
  });
  const [archivo, setArchivo] = useState(null);
  
  // Estados para Intereses Históricos
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyMonto, setHistoryMonto] = useState("");
  const [historyNotas, setHistoryNotas] = useState("");

  useEffect(() => {
    console.log('=== DEBUG: InversionDetalleView montado ===');
    console.log('ID recibido:', id);
    if (!id) {
      console.log('=== DEBUG: No hay ID, retornando ===');
      return;
    }

    const fetchData = async () => {
      try {
        console.log('=== DEBUG: Iniciando fetch ===');
        setLoading(true);
        const inversionRes = await inversionesApi.getById(id);
        console.log('=== DEBUG: Respuesta inversión ===', inversionRes.data);
        const data = inversionRes.data?.data;
        setInversion(data);

        const cuentasRes = await api.get('/cuentas');
        console.log('=== DEBUG: Respuesta cuentas ===', cuentasRes.data);
        setCuentas(cuentasRes.data?.data || []);
      } catch (error) {
        console.error("=== DEBUG: Error fetching inversion ===", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handlePayment = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Evitar doble clic (Error 2)

    try {
      setIsSubmitting(true);
      
      const payload = {
        ...paymentData,
        monto_capital: (parseFloat(String(paymentData.monto_capital).replace(/\./g, '')) || 0) * 1000,
        monto_interes: (parseFloat(String(paymentData.monto_interes).replace(/\./g, '')) || 0) * 1000,
        monto_total: (parseFloat(String(paymentData.monto_total).replace(/\./g, '')) || 0) * 1000
      };

      let dataToSend = payload;
      if (archivo && paymentData.metodo_pago === 'transferencia') {
        const formData = new FormData();
        Object.keys(payload).forEach(key => formData.append(key, payload[key]));
        formData.append('captura', archivo);
        dataToSend = formData;
      }

      await inversionesApi.pagar(id, dataToSend);
      toast.success("Pago registrado exitosamente");
      setShowPaymentModal(false);
      setArchivo(null);
      
      // Recargar datos
      const inversionRes = await inversionesApi.getById(id);
      setInversion(inversionRes.data?.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al registrar el pago");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHistorySubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      await inversionesApi.registrarInteresHistorico(id, {
        monto: parseFloat(historyMonto.replace(/\./g, '')),
        notas: historyNotas
      });
      toast.success("Intereses históricos registrados");
      setShowHistoryModal(false);
      setHistoryMonto("");
      setHistoryNotas("");
      
      const inversionRes = await inversionesApi.getById(id);
      setInversion(inversionRes.data?.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al registrar histórico");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {


    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div
            className={styles.loadingSkeleton}
            style={{ width: "200px", height: "2rem" }}
          ></div>
        </div>
      </div>
    );
  }

  if (!inversion) {
    return (
      <div className={styles.container}>
        <p>Inversión no encontrada</p>
        <Link href="/inversiones" className={styles.link}>
          ← Volver a inversiones
        </Link>
      </div>
    );
  }

  const getBadgeClass = (estado) => {
    switch (estado) {
      case "activo":
      case "activa":
        return styles.badgeSuccess;

      case "devuelta":
        return styles.badgeWarning;
      case "cancelada":
        return styles.badgeDanger;
      default:
        return styles.badgeWarning;
    }
  };

  // Si es modal y no está abierto, no renderizar
  if (isModal && !isOpen) return null;

  // Si no hay ID o está cargando, mostrar loading o null
  if (!id) return null;
  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</div>;
  if (!inversion) return <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>Error al cargar la inversión</div>;

  const content = (
    <div className={styles.container} style={isModal ? { maxHeight: '90vh', overflow: 'auto' } : {}}>
      <div className={styles.header}>
        <div className={styles.titleSection}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1>Inversión #{inversion.id?.slice(0, 8)}</h1>
            <span className={styles.badge} style={{ 
              background: inversion.calculos?.en_mora ? '#fee2e2' : '#f0fdf4', 
              color: inversion.calculos?.en_mora ? '#dc2626' : '#16a34a',
              border: '1px solid currentColor',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {inversion.calculos?.en_mora ? <AlertTriangle size={14} /> : <Calendar size={14} />}
              {inversion.calculos?.en_mora 
                ? `Vencido hace ${Math.abs(inversion.calculos?.dias_para_pago)} días` 
                : `Próximo pago: ${formatDate(inversion.calculos?.proxima_fecha_pago)}`}
            </span>
          </div>

          <p className={styles.subtitle}>Detalle de la inversión</p>
        </div>
        <div className={styles.actions}>
          {isModal ? (
            <button onClick={onClose} className={styles.btnSecondary}>
              <ArrowLeft size={18} />
              Cerrar
            </button>
          ) : (
            <Link href="/inversiones" className={styles.btnSecondary}>
              <ArrowLeft size={18} />
              Volver
            </Link>
          )}
          <button
            onClick={() => setShowHistoryModal(true)}
            className={styles.btnSecondary}
            style={{ borderColor: '#8b5cf6', color: '#8b5cf6' }}
          >
            <Clock size={18} />
            Ingresar Histórico
          </button>
          {(inversion.estado === "activa" || inversion.estado === "activo") && (
            <button
              onClick={() => {
                const interesSugerido = inversion.calculos?.interes_sugerido || 0;
                setPaymentData({
                  monto_total: interesSugerido ? new Intl.NumberFormat('es-CO').format(interesSugerido) : '',
                  monto_capital: '',
                  monto_interes: interesSugerido ? new Intl.NumberFormat('es-CO').format(interesSugerido) : '',
                  cuenta_id: '',
                  metodo_pago: 'transferencia',
                  notas: ''
                });
                setShowPaymentModal(true);
              }}
              className={styles.btnPrimary}
            >
              💸 Realizar Pago
            </button>
          )}
        </div>
      </div>

      {/* Modal de Pago Mejorado */}
      {showPaymentModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '500px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem' }}>
              <div style={{ background: '#dbeafe', padding: '0.5rem', borderRadius: '0.5rem' }}>
                <DollarSign size={24} color="#2563eb" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#111827' }}>Registrar Pago a Inversionista</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#6b7280' }}>
                  Inversión: #{inversion.id?.slice(0, 8)}
                </p>
              </div>
            </div>

            <form onSubmit={handlePayment}>
              <div className={styles.formGroup}>
                <label style={{ fontWeight: 500, color: '#374151' }}>Cuenta de Salida de Dinero</label>
                <select 
                  required
                  value={paymentData.cuenta_id}
                  onChange={e => setPaymentData({...paymentData, cuenta_id: e.target.value})}
                  style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', width: '100%' }}
                >
                  <option value="">Selecciona la cuenta de origen...</option>
                  {cuentas.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} ({formatCurrency(c.saldo_actual)})</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label style={{ fontWeight: 500, color: '#374151' }}>Método de Entrega</label>
                <select 
                  value={paymentData.metodo_pago}
                  onChange={e => setPaymentData({...paymentData, metodo_pago: e.target.value})}
                  style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', width: '100%' }}
                >
                  <option value="transferencia">Transferencia Bancaria</option>
                  <option value="efectivo">Efectivo Físico</option>
                </select>
              </div>

              {paymentData.metodo_pago === 'transferencia' && (
                <div className={styles.formGroup}>
                  <label style={{ fontWeight: 500, color: '#374151' }}>Soporte de Transferencia (Opcional)</label>
                  <input 
                    type="file" 
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={e => setArchivo(e.target.files[0])}
                    style={{ padding: '0.5rem', border: '1px dashed #9ca3af', borderRadius: '0.5rem', width: '100%', background: '#f9fafb' }}
                  />
                </div>
              )}

              <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0.75rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: '#334155' }}>Distribución del Pago</h4>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className={styles.formGroup} style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.85rem', color: '#475569' }}>Pago de Intereses</label>
                    <input 
                      type="text" value={paymentData.monto_interes}
                      onChange={e => {
                        const rawVal = e.target.value.replace(/\D/g, '');
                        const mi = parseFloat(rawVal) || 0;
                        const rawMc = parseFloat(String(paymentData.monto_capital).replace(/\./g, '')) || 0;
                        const total = mi + rawMc;
                        setPaymentData({
                          ...paymentData, 
                          monto_interes: rawVal ? new Intl.NumberFormat('es-CO').format(mi) : '',
                          monto_total: new Intl.NumberFormat('es-CO').format(total)
                        });
                      }}
                      style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', width: '100%' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                      <span style={{ color: '#64748b' }}>Generado:</span>
                      <span style={{ fontWeight: 600, color: '#059669' }}>{formatCurrency(inversion.calculos?.interes_sugerido || 0)}</span>
                    </div>
                  </div>

                  <div className={styles.formGroup} style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.85rem', color: '#475569' }}>Devolución de Capital</label>
                    <input 
                      type="text" value={paymentData.monto_capital}
                      onChange={e => {
                        const rawVal = e.target.value.replace(/\D/g, '');
                        const mc = parseFloat(rawVal) || 0;
                        const rawMi = parseFloat(String(paymentData.monto_interes).replace(/\./g, '')) || 0;
                        const total = mc + rawMi;
                        setPaymentData({
                          ...paymentData, 
                          monto_capital: rawVal ? new Intl.NumberFormat('es-CO').format(mc) : '',
                          monto_total: new Intl.NumberFormat('es-CO').format(total)
                        });
                      }}
                      style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', width: '100%' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                      <span style={{ color: '#64748b' }}>Máximo:</span>
                      <span style={{ fontWeight: 600, color: '#dc2626' }}>{formatCurrency(inversion.calculos?.capital_pendiente || 0)}</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: '#1e293b' }}>Total a Entregar:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }}>
                    {paymentData.monto_total || '$ 0'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
                <button type="button" onClick={() => setShowPaymentModal(false)} className={styles.btnSecondary} disabled={isSubmitting} style={{ padding: '0.75rem 1.5rem' }}>Cancelar</button>
                <button type="submit" className={styles.btnPrimary} disabled={isSubmitting} style={{ padding: '0.75rem 1.5rem' }}>
                  {isSubmitting ? 'Procesando...' : 'Confirmar Pago'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Histórico */}
      {showHistoryModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Ajustar Intereses Históricos</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
              Registra los intereses que el inversionista ya cobró en meses pasados. Esto aumentará su saldo en la Billetera para que puedas marcar el pago real.
            </p>
            <form onSubmit={handleHistorySubmit}>
              <div className={styles.formGroup}>
                <label>Monto de Interés Ganado</label>
                <input 
                  type="text" required value={historyMonto}
                  onChange={e => {
  const val = e.target.value.replace(/\D/g, '');
  setHistoryMonto(val ? new Intl.NumberFormat('es-CO').format(val) : '');
}}
                  placeholder="Ej: 5000000"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Notas / Periodo</label>
                <input 
                  type="text" 
                  value={historyNotas}
                  onChange={e => setHistoryNotas(e.target.value)}
                  placeholder="Ej: Intereses del año pasado"
                />
              </div>
              <div className={styles.formActions}>
                <button type="button" onClick={() => setShowHistoryModal(false)} className={styles.btnSecondary} disabled={isSubmitting}>Cancelar</button>
                <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Añadir al Saldo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid Superior: Inversionista + Resumen Financiero */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        
        {/* Card Inversionista (Compacta) */}
        <div className={styles.card} style={{ margin: 0 }}>
          <div className={styles.cardHeader} style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                width: "2.5rem", height: "2.5rem", borderRadius: "50%", 
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontWeight: 600 
              }}>
                {inversion.inversionista?.nombre_completo?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>{inversion.inversionista?.nombre_completo}</h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>{inversion.inversionista?.email}</p>
              </div>
            </div>
          </div>
          <div style={{ padding: '0 1rem 1rem 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: '#6b7280' }}>Teléfono:</span>
              <span style={{ fontWeight: 500 }}>{inversion.inversionista?.telefono || 'N/A'}</span>
            </div>
            <button 
              onClick={() => setShowPerfilModal(true)}
              className={styles.link} 
              style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.8rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
            >
              Ver perfil completo →
            </button>
          </div>
        </div>

        {/* Resumen Financiero (Compacto) */}
        <div className={styles.card} style={{ margin: 0 }}>
          <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', padding: '1rem' }}>
            <div className={styles.statItem} style={{ padding: 0, border: 'none' }}>
              <span className={styles.statLabel}>Capital Pendiente</span>
              <p className={styles.statValue} style={{ fontSize: '1.25rem' }}>{formatCurrency(inversion.calculos?.capital_pendiente || 0)}</p>
            </div>
            <div className={styles.statItem} style={{ padding: 0, border: 'none', textAlign: 'right' }}>
              <span className={styles.statLabel}>Interés Sugerido</span>
              <p className={styles.statValue} style={{ fontSize: '1.25rem', color: inversion.calculos?.en_mora ? '#dc2626' : '#10b981' }}>
                {formatCurrency(inversion.calculos?.interes_sugerido || 0)}
              </p>
            </div>
            <div className={styles.statItem} style={{ padding: 0, border: 'none' }}>
              <span className={styles.statLabel}>Inversión Original</span>
              <p style={{ margin: 0, fontWeight: 500 }}>{formatCurrency(inversion.monto_invertido)}</p>
            </div>
            <div className={styles.statItem} style={{ padding: 0, border: 'none', textAlign: 'right' }}>
              <span className={styles.statLabel}>Tasa Mensual</span>
              <p style={{ margin: 0, fontWeight: 500 }}>{inversion.tasa_interes_pactada}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de métricas secundaria (Más compacta) */}
      <div className={styles.infoBar} style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Fecha Inicio</span>
          <span className={styles.infoBarValue} style={{ fontSize: '0.9rem' }}>{formatDate(inversion.fecha_inversion)}</span>
        </div>
        <div className={styles.infoBarSeparator}></div>
        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>En la Calle</span>
          <span className={styles.infoBarValue} style={{ fontSize: '0.9rem' }}>{formatCurrency(inversion.calculos?.monto_en_calle || 0)}</span>
        </div>
        <div className={styles.infoBarSeparator}></div>
        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Disponible</span>
          <span className={styles.infoBarValue} style={{ fontSize: '0.9rem' }}>{formatCurrency(inversion.calculos?.disponible_en_cuenta || 0)}</span>
        </div>
        <div className={styles.infoBarSeparator}></div>
        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Retorno Total</span>
          <span className={styles.infoBarValue} style={{ fontSize: '0.9rem' }}>{formatCurrency(inversion.calculos?.retorno_total || 0)}</span>
        </div>
      </div>


      {/* Préstamos Financiados (Trazabilidad) */}
      <div className={styles.card} style={{ marginTop: "1.5rem" }}>
        <div className={styles.cardHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={20} color="#2563eb" />
            <h2 className={styles.sectionTitle}>Préstamos Financiados (Trazabilidad)</h2>
          </div>
          <span className={styles.badge} style={{ background: '#dbeafe', color: '#1e40af' }}>
            {inversion.prestamos_financiados?.length || 0} Préstamos
          </span>
        </div>
        
        {inversion.prestamos_financiados && inversion.prestamos_financiados.length > 0 ? (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Deudor</th>
                  <th>Capital Aportado</th>
                  <th>Saldo Pendiente</th>
                  <th>Próximo Pago</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {inversion.prestamos_financiados.map((pf) => (
                  <tr key={pf.id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600 }}>{pf.cliente.nombre_completo}</span>
                        <span style={{ fontSize: '0.7rem', color: '#6b7280' }}>ID: {pf.id.slice(0, 8)}</span>
                      </div>
                    </td>
                    <td>{formatCurrency(pf.monto_aportado)}</td>
                    <td style={{ color: '#ef4444', fontWeight: 500 }}>
                      {formatCurrency(pf.calculos.saldo_calle_proporcional)}
                    </td>
                    <td>{formatDate(pf.fecha_vencimiento)}</td>
                    <td>
                      <span className={`${styles.badge} ${pf.estado === 'activo' ? styles.badgeSuccess : styles.badgeWarning}`}>
                        {pf.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <PieChart size={40} style={{ marginBottom: '1rem', opacity: 0.2 }} />
            <p>Este capital aún no ha sido prestado a ningún cliente.</p>
          </div>
        )}
      </div>

      {/* Desglose de Pagos de Deudores */}
      {inversion.prestamos_financiados?.some(pf => pf.movimientos?.length > 0) && (
        <div className={styles.card} style={{ marginTop: "1.5rem" }}>
          <div className={styles.cardHeader}>
            <h2 className={styles.sectionTitle}>Recaudos de Préstamos (Intereses/Capital)</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {inversion.prestamos_financiados.flatMap(pf => 
              pf.movimientos.map(mov => ({ ...mov, cliente: pf.cliente.nombre_completo }))
            )
            .sort((a, b) => new Date(b.fecha_operacion) - new Date(a.fecha_operacion))
            .slice(0, 10) // Mostrar los últimos 10
            .map((mov, idx) => (
              <div key={idx} className={styles.movementItem}>
                <div className={styles.movementIcon} style={{ background: '#eff6ff' }}>
                  <ArrowUpRight size={16} color="#3b82f6" />
                </div>
                <div className={styles.movementInfo}>
                  <p className={styles.movementTitle}>{mov.cliente}</p>
                  <p className={styles.movementDate}>
                    {formatDate(mov.fecha_operacion)} · {mov.metodo_pago}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.7rem', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
                      Cap: {formatCurrency(mov.monto_capital)}
                    </span>
                    <span style={{ fontSize: '0.7rem', background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>
                      Int: {formatCurrency(mov.monto_interes)}
                    </span>
                  </div>
                </div>
                <div className={styles.movementAmount} style={{ color: '#2563eb', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                  {formatCurrency(mov.monto_total)}
                  {mov.url_captura && (
                    <a href={`/api/uploads/documentos/${mov.url_captura}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}>
                      <FileText size={12} /> Ver captura
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historial de Movimientos */}
      {inversion.movimientos && inversion.movimientos.length > 0 && (
        <div className={styles.card} style={{ marginTop: "1.5rem" }}>
          <div className={styles.cardHeader}>
            <h2 className={styles.sectionTitle}>Historial de Movimientos</h2>
          </div>
          {inversion.movimientos.map((mov) => (
            <div key={mov.id} className={styles.movementItem}>
              <div
                className={styles.movementIcon}
                style={{ background: "#dcfce7" }}
              >
                <TrendingUp size={16} color="#16a34a" />
              </div>
              <div className={styles.movementInfo}>
                <p className={styles.movementTitle}>
                  {mov.tipo === "devolucion_inversion"
                    ? "Devolución"
                    : mov.tipo}
                </p>
                <p className={styles.movementDate}>
                  {formatDate(mov.fecha_operacion)}
                </p>
              </div>
              <div
                className={styles.movementAmount}
                style={{ color: "#16a34a", display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}
              >
                +{formatCurrency(mov.monto_total)}
                {mov.url_captura && (
                  <a href={`/api/uploads/documentos/${mov.url_captura}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}>
                    <FileText size={12} /> Ver captura
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Si es modal, envolver en overlay
  if (isModal) {
    return (
      <div 
        className={styles.modalOverlay} 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            maxWidth: '900px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <>
      {content}
      {/* Modal del Perfil del Inversionista - mismo Modal que PersonasView */}
      <Modal
        isOpen={showPerfilModal}
        onClose={() => setShowPerfilModal(false)}
        title="Detalle del Perfil"
        size="lg"
      >
        {inversion?.inversionista?.id && (
          <PersonaDetalleView id={inversion.inversionista.id} isModal={true} />
        )}
      </Modal>
    </>
  );
}
