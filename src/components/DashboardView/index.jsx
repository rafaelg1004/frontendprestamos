"use client";

import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";
import {
  formatCurrency,
  formatNumber,
  formatDateTime,
  getTipoMovimientoLabel,
  calcularDiasMora,
} from "@/lib/utils";
import {
  Users,
  Banknote,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import styles from "./DashboardView.module.css";

export function DashboardView() {
  const [stats, setStats] = useState(null);
  const [movements, setMovements] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, movementsRes, alertsRes] = await Promise.all([
          dashboardApi.getResumen(),
          dashboardApi.getMovimientosRecientes(5),
          dashboardApi.getAlertasVencimientos(),
        ]);

        setStats(statsRes.data.data);
        setMovements(movementsRes.data.data || []);
        setAlerts(alertsRes.data.data || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getFlowIcon = (tipo) => {
    const isEntrada = tipo === "recibo_inversion" || tipo === "pago_cliente";
    return isEntrada ? (
      <ArrowDownLeft className={styles.flowIconGreen} />
    ) : (
      <ArrowUpRight className={styles.flowIconRed} />
    );
  };

  const getAlertIcon = (nivel) => {
    switch (nivel) {
      case "vencido":
        return <AlertTriangle className={styles.iconRed} />;
      case "critico":
        return <Clock className={styles.iconOrange} />;
      default:
        return <CheckCircle className={styles.iconYellow} />;
    }
  };

  const getAlertClass = (nivel) => {
    switch (nivel) {
      case "vencido":
        return styles.alertVencido;
      case "critico":
        return styles.alertCritico;
      default:
        return styles.alertProximo;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <div className={`${styles.skeleton} ${styles.skeletonTitle}`}></div>
            <div
              className={`${styles.skeleton} ${styles.skeletonText}`}
              style={{ width: "200px" }}
            ></div>
          </div>
        </div>
        <div className={styles.statsGrid}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statInfo}>
                  <div
                    className={`${styles.skeleton} ${styles.skeletonText}`}
                  ></div>
                  <div
                    className={`${styles.skeleton} ${styles.skeletonTitle}`}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <p>Error al cargar los datos del dashboard</p>
          <button
            onClick={() => window.location.reload()}
            className={styles.btnRetry}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const criticalAlerts = alerts.filter(
    (a) => a.nivel_alerta === "vencido" || a.nivel_alerta === "critico",
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Resumen de tu operación financiera</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Total Clientes</p>
              <p className={styles.statValue}>
                {formatNumber(stats.perfiles.total_clientes)}
              </p>
            </div>
            <div className={`${styles.statIcon} ${styles.iconBlue}`}>
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Capital en la Calle</p>
              <p className={styles.statValue}>
                {formatCurrency(stats.prestamos.monto_activos)}
              </p>
              <p className={styles.statSubtext}>
                {stats.prestamos.activos} préstamos activos
              </p>
            </div>
            <div className={`${styles.statIcon} ${styles.iconGreen}`}>
              <Banknote size={24} />
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Deuda con Inversionistas</p>
              <p className={styles.statValue}>
                {formatCurrency(stats.inversiones.monto_activas)}
              </p>
              <p className={styles.statSubtext}>
                {stats.inversiones.activas} inversiones activas
              </p>
            </div>
            <div className={`${styles.statIcon} ${styles.iconPurple}`}>
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Préstamos en Mora</p>
              <p className={styles.statValue}>{stats.prestamos.en_mora}</p>
              <p className={styles.statSubtext}>
                {stats.prestamos.mora_potencial > 0
                  ? `Mora: ${formatCurrency(stats.prestamos.mora_potencial)}`
                  : "Sin mora actual"}
              </p>
            </div>
            <div className={`${styles.statIcon} ${styles.iconRed}`}>
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className={styles.grid2Cols}>
        {/* Recent Movements */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Movimientos Recientes</h3>
          <div className={styles.movementList}>
            {movements.length === 0 ? (
              <p className={styles.emptyState}>
                No hay movimientos registrados
              </p>
            ) : (
              movements.map((mov, index) => (
                <div
                  key={mov.movimiento_id || `mov-${index}`}
                  className={styles.movementItem}
                >
                  <div className={styles.movementIcon}>
                    {getFlowIcon(mov.tipo_movimiento)}
                  </div>
                  <div className={styles.movementInfo}>
                    <p className={styles.movementType}>
                      {getTipoMovimientoLabel(mov.tipo_movimiento)}
                    </p>
                    <p className={styles.movementMeta}>
                      {mov.nombre_perfil} •{" "}
                      {formatDateTime(mov.fecha_operacion)}
                    </p>
                  </div>
                  <div
                    className={`${styles.movementAmount} ${
                      mov.tipo_movimiento === "recibo_inversion" ||
                      mov.tipo_movimiento === "pago_cliente"
                        ? styles.amountPositive
                        : styles.amountNegative
                    }`}
                  >
                    {formatCurrency(mov.monto_total)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alerts */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Alertas de Vencimiento</h3>
            {criticalAlerts.length > 0 && (
              <span className={`${styles.badge} ${styles.badgeDanger}`}>
                {criticalAlerts.length} críticas
              </span>
            )}
          </div>

          <div className={styles.alertList}>
            {alerts.length === 0 ? (
              <div className={styles.emptyState}>
                <CheckCircle
                  size={48}
                  className={styles.iconGreen}
                  style={{ margin: "0 auto 12px" }}
                />
                <p>Sin alertas próximas</p>
              </div>
            ) : (
              alerts.slice(0, 5).map((alert, index) => (
                <Link
                  key={alert.prestamo_id || `alert-${index}`}
                  href={`/prestamos/${alert.prestamo_id}`}
                  className={`${styles.alertItem} ${getAlertClass(alert.nivel_alerta)}`}
                >
                  <div className={styles.alertContent}>
                    <div className={styles.alertIcon}>
                      {getAlertIcon(alert.nivel_alerta)}
                    </div>
                    <div className={styles.alertInfo}>
                      <div className={styles.alertHeader}>
                        <p className={styles.alertClient}>{alert.cliente}</p>
                        <span
                          className={`${styles.alertDays} ${
                            alert.dias_restantes <= 0
                              ? styles.alertDaysVencido
                              : styles.alertDaysCritico
                          }`}
                        >
                          {alert.dias_restantes <= 0
                            ? `Vencido hace ${Math.abs(alert.dias_restantes)} días`
                            : `${alert.dias_restantes} días restantes`}
                        </span>
                      </div>
                      <p className={styles.alertDetails}>
                        Vence: {formatDate(alert.fecha_vencimiento)} • Saldo:{" "}
                        {formatCurrency(alert.saldo_pendiente)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {alerts.length > 5 && (
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              <Link href="/prestamos?estado=activo" className={styles.link}>
                Ver todas las alertas →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
