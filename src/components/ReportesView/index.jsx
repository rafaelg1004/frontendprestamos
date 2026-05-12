'use client'

import { useState, useEffect } from 'react'
import { reportesApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Download,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  ArcElement,
} from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'
import styles from './ReportesView.module.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

export function ReportesView() {
  const [rentabilidad, setRentabilidad] = useState([])
  const [cartera, setCartera] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [rentRes, cartRes] = await Promise.all([
          reportesApi.getRentabilidad(),
          reportesApi.getCartera()
        ])
        setRentabilidad(rentRes.data?.data || [])
        setCartera(cartRes.data?.data || null)
      } catch (error) {
        console.error('Error al cargar reportes:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <div className={styles.loading}>Analizando datos financieros...</div>

  // Configuración para el gráfico de barras de rentabilidad
  const rentabilidadChartData = {
    labels: [...rentabilidad].reverse().map(r => r.nombre_mes),
    datasets: [
      {
        label: 'Intereses Clientes (+)',
        data: [...rentabilidad].reverse().map(r => r.intereses_clientes / 1000),
        backgroundColor: '#10b981',
        borderRadius: 4,
      },
      {
        label: 'Intereses Inversionistas (-)',
        data: [...rentabilidad].reverse().map(r => r.intereses_inversionistas / 1000),
        backgroundColor: '#ef4444',
        borderRadius: 4,
      },
    ],
  }

  // Gráfico de distribución de cartera
  const distribucionData = {
    labels: cartera?.distribucion?.map(d => d.frecuencia_pago) || [],
    datasets: [
      {
        data: cartera?.distribucion?.map(d => d.monto / 1000) || [],
        backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'],
        borderWidth: 0,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => '$' + value.toLocaleString()
        }
      }
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <BarChart3 size={28} />
            Reportes e Inteligencia
          </h1>
          <p className={styles.subtitle}>Análisis profundo de tu negocio financiero</p>
        </div>
        <button className={styles.btnExport} onClick={() => window.print()}>
          <Download size={18} />
          Exportar PDF
        </button>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.kpiInfo}>
            <p className={styles.kpiLabel}>Capital en Calle</p>
            <h3 className={styles.kpiValue}>{formatCurrency(cartera?.resumen?.capital_en_calle || 0)}</h3>
            <span className={styles.kpiTrend}>
              <ArrowUpRight size={14} /> Activo
            </span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
            <AlertTriangle size={24} />
          </div>
          <div className={styles.kpiInfo}>
            <p className={styles.kpiLabel}>En Mora</p>
            <h3 className={styles.kpiValue}>{cartera?.resumen?.prestamos_en_mora || 0} préstamos</h3>
            <span className={styles.kpiTrend} style={{ color: '#dc2626' }}>
              Riesgo detectado
            </span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ backgroundColor: '#dbeafe', color: '#2563eb' }}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.kpiInfo}>
            <p className={styles.kpiLabel}>Utilidad Neta (Mes)</p>
            <h3 className={styles.kpiValue}>{formatCurrency(rentabilidad[0]?.utilidad_neta || 0)}</h3>
            <span className={styles.kpiTrend}>
              <TrendingUp size={14} /> vs mes anterior
            </span>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Gráfico de Rentabilidad */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.sectionTitle}>Rentabilidad: Cobros vs Pagos</h2>
          </div>
          <div className={styles.chartWrapper}>
            <Bar data={rentabilidadChartData} options={chartOptions} />
          </div>
        </div>

        {/* Distribución de Cartera */}
        <div className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.sectionTitle}>Distribución por Frecuencia</h2>
          </div>
          <div className={styles.pieWrapper}>
            <Pie data={distribucionData} options={{ plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>
      </div>

      {/* Tabla de Rentabilidad Histórica */}
      <div className={styles.tableCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.sectionTitle}>Historial de Ganancias Mensuales</h2>
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Mes</th>
                <th>Int. Clientes</th>
                <th>Mora Recaudada</th>
                <th>Int. Inversionistas</th>
                <th>Utilidad Neta</th>
              </tr>
            </thead>
            <tbody>
              {rentabilidad.map((r, i) => (
                <tr key={i}>
                  <td>{r.nombre_mes}</td>
                  <td>{formatCurrency(r.intereses_clientes)}</td>
                  <td>{formatCurrency(r.mora_recaudada)}</td>
                  <td style={{ color: '#dc2626' }}>-{formatCurrency(r.intereses_inversionistas)}</td>
                  <td style={{ fontWeight: 700, color: r.utilidad_neta >= 0 ? '#16a34a' : '#dc2626' }}>
                    {formatCurrency(r.utilidad_neta)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
