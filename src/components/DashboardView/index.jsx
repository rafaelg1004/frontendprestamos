"use client";

import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";
import {
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateTime,
  getTipoMovimientoLabel,
  calcularDiasMora,
} from "@/lib/utils";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend
);
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
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, movementsRes, alertsRes, chartRes] = await Promise.all([
          dashboardApi.getResumen(),
          dashboardApi.getMovimientosRecientes(5),
          dashboardApi.getAlertasVencimientos(),
          dashboardApi.getFlujoCajaHistorico(),
        ]);

        setStats(statsRes.data.data);
        setMovements(movementsRes.data.data || []);
        setAlerts(alertsRes.data.data || []);
        setChartData(chartRes.data.data || []);
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
        return <AlertTriangle className={styles.iconRed} size={20} />;
      case "critico":
        return <Clock className={styles.iconOrange} size={20} />;
      default:
        return <CheckCircle className={styles.iconYellow} size={20} />;
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
            <div className={`${styles.skeleton} ${styles.skeletonTitle}`} style={{ width: '250px' }}></div>
            <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '350px' }}></div>
          </div>
        </div>
        <div className={styles.statsGrid}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statInfo}>
                  <div className={`${styles.skeleton} ${styles.skeletonText}`} style={{ width: '60%' }}></div>
                  <div className={`${styles.skeleton} ${styles.skeletonTitle}`} style={{ width: '80%', height: '2rem' }}></div>
                </div>
                <div className={`${styles.skeleton}`} style={{ width: '3.5rem', height: '3.5rem', borderRadius: '0.75rem' }}></div>
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
        <div className={styles.card} style={{ textAlign: 'center', padding: '4rem' }}>
          <AlertTriangle size={48} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
          <h2 className={styles.cardTitle}>Error al cargar datos</h2>
          <p className={styles.subtitle}>No pudimos recuperar la información del servidor.</p>
          <button onClick={() => window.location.reload()} className={styles.link} style={{ marginTop: '1.5rem', cursor: 'pointer', border: 'none', background: 'none' }}>
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { weight: '600' }
        }
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 14, weight: '700' },
        bodyFont: { size: 13 },
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('es-CO', { 
                style: 'currency', 
                currency: 'COP',
                maximumFractionDigits: 0 
              }).format(context.parsed.y * 1000);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { weight: '600' } }
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: {
          callback: (value) => `$${value}k`,
          font: { weight: '600' }
        }
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Panel de Control</h1>
          <p className={styles.subtitle}>Gestión integral de tu operación financiera</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Clientes</p>
              <p className={styles.statValue}>{formatNumber(stats.perfiles.total_clientes)}</p>
              <div className={styles.statSubtext}>
                <Users size={14} /> Total registrados
              </div>
            </div>
            <div className={`${styles.statIcon} ${styles.iconBlue}`}>
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Capital Activo</p>
              <p className={styles.statValue}>{formatCurrency(stats.prestamos.monto_activos)}</p>
              <div className={styles.statSubtext}>
                <Banknote size={14} /> {stats.prestamos.activos} préstamos
              </div>
            </div>
            <div className={`${styles.statIcon} ${styles.iconGreen}`}>
              <Banknote size={24} />
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Deuda Inversión</p>
              <p className={styles.statValue}>{formatCurrency(stats.inversiones.monto_activas)}</p>
              <div className={styles.statSubtext}>
                <TrendingUp size={14} /> {stats.inversiones.activas} activas
              </div>
            </div>
            <div className={`${styles.statIcon} ${styles.iconPurple}`}>
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statContent}>
            <div className={styles.statInfo}>
              <p className={styles.statLabel}>Mora</p>
              <p className={`${styles.statValue} ${stats.prestamos.en_mora > 0 ? styles.textRed : ''}`}>
                {stats.prestamos.en_mora}
              </p>
              <div className={styles.statSubtext}>
                <AlertTriangle size={14} /> {formatCurrency(stats.prestamos.mora_potencial)}
              </div>
            </div>
            <div className={`${styles.statIcon} ${styles.iconRed}`}>
              <AlertTriangle size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.grid2Cols}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Flujo de Caja Mensual</h3>
          </div>
          <div className={styles.chartContainer}>
            {chartData && (
              <Bar 
                data={{
                  labels: chartData.map(d => d.nombre_mes),
                  datasets: [
                    {
                      label: 'Entradas',
                      data: chartData.map(d => d.entradas / 1000),
                      backgroundColor: '#10b981',
                      borderRadius: 6,
                      hoverBackgroundColor: '#059669',
                    },
                    {
                      label: 'Salidas',
                      data: chartData.map(d => d.salidas / 1000),
                      backgroundColor: '#f43f5e',
                      borderRadius: 6,
                      hoverBackgroundColor: '#e11d48',
                    }
                  ]
                }}
                options={chartOptions}
              />
            )}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardHeader}>Balance General</h3>
          </div>
          <div className={styles.balanceGrid}>
            <div className={styles.balanceItem}>
              <p className={styles.balanceLabel}>Activos (Recaudos)</p>
              <p className={`${styles.balanceValue} ${styles.textGreen}`}>
                {formatCurrency(stats.balance_general.activos)}
              </p>
            </div>
            <div className={styles.balanceItem}>
              <p className={styles.balanceLabel}>Pasivos (Inversiones)</p>
              <p className={`${styles.balanceValue} ${styles.textRed}`}>
                {formatCurrency(stats.balance_general.pasivos)}
              </p>
            </div>
            <div className={styles.balanceDivider}></div>
            <div className={styles.balanceItem} style={{ background: 'var(--primary-light)' }}>
              <p className={styles.balanceLabel}>Patrimonio Estimado</p>
              <p className={`${styles.balanceValue} ${styles.textBlue}`}>
                {formatCurrency(stats.balance_general.patrimonio_neto)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.grid2Cols}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Movimientos Recientes</h3>
          </div>
          <div className={styles.movementList}>
            {movements.length === 0 ? (
              <p className={styles.emptyState}>No hay actividad reciente</p>
            ) : (
              movements.map((mov, index) => (
                <div key={mov.movimiento_id || index} className={styles.movementItem}>
                  <div className={styles.movementIcon}>
                    {getFlowIcon(mov.tipo_movimiento)}
                  </div>
                  <div className={styles.movementInfo}>
                    <p className={styles.movementType}>{getTipoMovimientoLabel(mov.tipo_movimiento)}</p>
                    <p className={styles.movementMeta}>
                      {mov.nombre_perfil} • {formatDateTime(mov.fecha_operacion)}
                    </p>
                  </div>
                  <div className={`${styles.movementAmount} ${
                    mov.tipo_movimiento.includes('pago') || mov.tipo_movimiento.includes('recibo') 
                    ? styles.amountPositive : styles.amountNegative
                  }`}>
                    {formatCurrency(mov.monto_total)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Alertas Prioritarias</h3>
            {alerts.filter(a => a.nivel_alerta === 'vencido').length > 0 && (
              <span className={`${styles.badge} ${styles.badgeDanger}`}>
                {alerts.filter(a => a.nivel_alerta === 'vencido').length} Vencidos
              </span>
            )}
          </div>

          <div className={styles.alertList}>
            {alerts.length === 0 ? (
              <div className={styles.emptyState}>
                <CheckCircle size={40} className={styles.iconGreen} style={{ margin: '0 auto 1rem' }} />
                <p>Todo al día</p>
              </div>
            ) : (
              alerts.slice(0, 4).map((alert, index) => (
                <Link 
                  key={alert.prestamo_id || index} 
                  href={`/prestamos/${alert.prestamo_id}`}
                  className={`${styles.alertItem} ${getAlertClass(alert.nivel_alerta)}`}
                >
                  <div className={styles.alertContent}>
                    <div className={styles.alertIcon}>{getAlertIcon(alert.nivel_alerta)}</div>
                    <div className={styles.alertInfo}>
                      <div className={styles.alertHeader}>
                        <p className={styles.alertClient}>{alert.cliente}</p>
                        <span className={styles.alertDays}>
                          {alert.dias_restantes <= 0 ? 'MORA' : `${alert.dias_restantes}d`}
                        </span>
                      </div>
                      <p className={styles.alertDetails}>
                        Saldo: {formatCurrency(alert.saldo_pendiente)} • Vence: {formatDate(alert.fecha_vencimiento)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
          {alerts.length > 4 && (
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link href="/prestamos" className={styles.link}>Ver todas las alertas →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
