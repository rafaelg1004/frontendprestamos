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
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import styles from "../PrestamoDetalleView/PrestamoDetalleView.module.css";

export function InversionDetalleView({ id }) {
  const [inversion, setInversion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [cuentas, setCuentas] = useState([]);
  const [paymentData, setPaymentData] = useState({
    monto_total: 0,
    monto_capital: 0,
    monto_interes: 0,
    cuenta_id: '',
    metodo_pago: 'transferencia',
    notas: ''
  });

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const inversionRes = await inversionesApi.getById(id);
        const data = inversionRes.data?.data;
        setInversion(data);
        
        // Cargar interés sugerido automáticamente
        if (data?.calculos?.interes_sugerido) {
          setPaymentData(prev => ({
            ...prev,
            monto_interes: data.calculos.interes_sugerido,
            monto_total: data.calculos.interes_sugerido + prev.monto_capital
          }));
        }

        const cuentasRes = await api.get('/cuentas');
        setCuentas(cuentasRes.data?.data || []);
      } catch (error) {
        console.error("Error fetching inversion:", error);
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
      await inversionesApi.pagar(id, paymentData);
      toast.success("Pago registrado exitosamente");
      setShowPaymentModal(false);
      
      // Recargar datos
      const inversionRes = await inversionesApi.getById(id);
      setInversion(inversionRes.data?.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al registrar el pago");
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

  return (
    <div className={styles.container}>
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
          <Link href="/inversiones" className={styles.btnSecondary}>
            <ArrowLeft size={18} />
            Volver
          </Link>
          {(inversion.estado === "activa" || inversion.estado === "activo") && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className={styles.btnPrimary}
            >
              💸 Realizar Pago
            </button>
          )}
        </div>
      </div>

      {/* Modal de Pago */}
      {showPaymentModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Registrar Pago a Inversionista</h3>
            <form onSubmit={handlePayment}>
              <div className={styles.formGroup}>
                <label>Cuenta de Salida</label>
                <select 
                  required
                  value={paymentData.cuenta_id}
                  onChange={e => setPaymentData({...paymentData, cuenta_id: e.target.value})}
                >
                  <option value="">Selecciona una cuenta</option>
                  {cuentas.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} ({formatCurrency(c.saldo_actual)})</option>
                  ))}
                </select>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>Monto Interés</label>
                  <input 
                    type="number" 
                    value={paymentData.monto_interes}
                    onChange={e => {
                      const mi = parseFloat(e.target.value) || 0;
                      setPaymentData({
                        ...paymentData, 
                        monto_interes: mi,
                        monto_total: mi + paymentData.monto_capital
                      });
                    }}
                  />
                  <p style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '4px' }}>
                    Sugerido: {formatCurrency(inversion.calculos?.interes_sugerido || 0)}
                  </p>
                </div>
                <div className={styles.formGroup}>
                  <label>Monto Capital</label>
                  <input 
                    type="number" 
                    max={inversion.calculos?.capital_pendiente}
                    value={paymentData.monto_capital}
                    onChange={e => {
                      const mc = parseFloat(e.target.value) || 0;
                      setPaymentData({
                        ...paymentData, 
                        monto_capital: mc,
                        monto_total: mc + paymentData.monto_interes
                      });
                    }}
                  />
                  <p style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '4px' }}>
                    Máximo: {formatCurrency(inversion.calculos?.capital_pendiente || 0)}
                  </p>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Total a Pagar</label>
                <input type="text" readOnly value={formatCurrency(paymentData.monto_total)} />
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={() => setShowPaymentModal(false)} className={styles.btnSecondary} disabled={isSubmitting}>Cancelar</button>
                <button type="submit" className={styles.btnPrimary} disabled={isSubmitting}>
                  {isSubmitting ? 'Procesando...' : 'Confirmar Pago'}
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
            <Link href={`/perfiles/${inversion.inversionista?.id}`} className={styles.link} style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.8rem' }}>
              Ver perfil completo →
            </Link>
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
                <div className={styles.movementAmount} style={{ color: '#2563eb' }}>
                  {formatCurrency(mov.monto_total)}
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
                style={{ color: "#16a34a" }}
              >
                +{formatCurrency(mov.monto_total)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
