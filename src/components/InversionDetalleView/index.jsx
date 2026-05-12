"use client";

import { useEffect, useState } from "react";
import { inversionesApi, perfilesApi } from "@/lib/api";
import { formatDate, formatCurrency } from "@/lib/utils";
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
  Briefcase
} from "lucide-react";
import Link from "next/link";
import styles from "../PrestamoDetalleView/PrestamoDetalleView.module.css";

export function InversionDetalleView({ id }) {
  const [inversion, setInversion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const inversionRes = await inversionesApi.getById(id);
        setInversion(inversionRes.data?.data);
      } catch (error) {
        console.error("Error fetching inversion:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
          <h1>Inversión #{inversion.id?.slice(0, 8)}</h1>
          <p className={styles.subtitle}>Detalle de la inversión</p>
        </div>
        <div className={styles.actions}>
          <Link href="/inversiones" className={styles.btnSecondary}>
            <ArrowLeft size={18} />
            Volver
          </Link>
          {inversion.estado === "activa" && (
            <Link
              href={`/inversiones/${inversion.id}/devolucion`}
              className={styles.btnPrimary}
            >
              Registrar Devolución
            </Link>
          )}
        </div>
      </div>

      {/* Info del Inversionista - Primero (compacto) */}
      <div className={styles.card} style={{ marginBottom: "1rem" }}>
        <div className={styles.cardHeader}>
          <h2 className={styles.sectionTitle}>Inversionista</h2>
        </div>

        {inversion.inversionista ? (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <div
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "white",
                }}
              >
                {inversion.inversionista.nombre_completo?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: "1rem" }}>
                  {inversion.inversionista.nombre_completo}
                </p>
                <Link
                  href={`/inversionistas/${inversion.inversionista.id}`}
                  className={styles.link}
                  style={{ fontSize: "0.875rem" }}
                >
                  Ver perfil →
                </Link>
              </div>
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Email</span>
                <span className={styles.infoValue}>{inversion.inversionista.email}</span>
              </div>
              {inversion.inversionista.telefono && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Teléfono</span>
                  <span className={styles.infoValue}>
                    {inversion.inversionista.telefono}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className={styles.emptyState}>
            Información del inversionista no disponible
          </p>
        )}
      </div>

      {/* Resumen de Fondos */}
      <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '1.5rem' }}>
        <div className={styles.statItem} style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Activity size={14} color="#3b82f6" />
            <span className={styles.statLabel}>Disponible</span>
          </div>
          <p className={styles.statValue}>{formatCurrency(inversion.calculos?.disponible_en_cuenta || 0)}</p>
        </div>
        <div className={styles.statItem} style={{ borderLeft: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <TrendingUp size={14} color="#ef4444" />
            <span className={styles.statLabel}>En la Calle</span>
          </div>
          <p className={styles.statValue}>{formatCurrency(inversion.calculos?.monto_en_calle || 0)}</p>
        </div>
        <div className={styles.statItem} style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Calendar size={14} color="#10b981" />
            <span className={styles.statLabel}>A Pagar (Mes)</span>
          </div>
          <p className={styles.statValue}>{formatCurrency(inversion.calculos?.interes_proximo_mes || 0)}</p>
        </div>
      </div>

      <div className={styles.infoBar}>
        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Inversión Total</span>
          <span className={styles.infoBarValue}>
            {formatCurrency(inversion.monto_invertido)}
          </span>
        </div>
        <div className={styles.infoBarSeparator}></div>

        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Retorno Total</span>
          <span className={styles.infoBarValue}>
            {formatCurrency(inversion.calculos?.retorno_total || 0)}
          </span>
        </div>
        <div className={styles.infoBarSeparator}></div>

        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Tasa Pactada</span>
          <span className={styles.infoBarValue}>
            {inversion.tasa_interes_pactada}%
          </span>
        </div>
        <div className={styles.infoBarSeparator}></div>

        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Fecha Inicio</span>
          <span className={styles.infoBarValue}>
            {formatDate(inversion.fecha_inversion)}
          </span>
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
