"use client";

import { useState } from "react";
import {
  Search,
  CreditCard,
  Briefcase,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Percent,
  CalendarDays,
  FileText
} from "lucide-react";
import { inversionesApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import styles from "../consulta/Consulta.module.css";
import { format } from "date-fns";
import { es } from "date-fns/locale";

// Chart.js imports
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ConsultaInversionistaPage() {
  const [cedula, setCedula] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState(null);
  const [error, setError] = useState("");

  const handleConsulta = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResultados(null);

    try {
      const response = await inversionesApi.getPublicByCedula(cedula);
      setResultados(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al consultar inversiones");
      toast.error("Error al consultar");
    } finally {
      setLoading(false);
    }
  };

  // Chart data setup
  const chartData = resultados ? {
    labels: ['Capital Activo', 'Ganancias Pagadas'],
    datasets: [
      {
        data: [
          resultados.resumen.capital_todavia_adeudado || 0,
          resultados.resumen.intereses_pagados || 0
        ],
        backgroundColor: ['#1e40af', '#16a34a'],
        borderColor: ['#1e3a8a', '#14532d'],
        borderWidth: 1,
      },
    ],
  } : null;

  const chartOptions = {
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            if (context.raw !== null) {
              label += new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(context.raw);
            }
            return label;
          }
        }
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card} style={{ maxWidth: '900px' }}>
        <div className={styles.header}>
          <div className={styles.icon} style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
            <TrendingUp size={48} />
          </div>
          <h1 className={styles.title}>Portal del Inversionista</h1>
          <p className={styles.subtitle}>
            Consulta el rendimiento y estado de tu capital ingresando tu cédula
          </p>
        </div>

        <form onSubmit={handleConsulta} className={styles.form}>
          <div className={styles.field}>
            <div className={styles.inputWrapper}>
              <CreditCard className={styles.inputIcon} />
              <input
                type="text"
                className={styles.input}
                placeholder="Ingresa tu documento de identidad"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.button} style={{ backgroundColor: '#16a34a' }} disabled={loading}>
            {loading ? "Consultando..." : "Consultar Capital"}
          </button>

          {error && (
            <div className={styles.error}>
              <AlertCircle size={20} />
              {error}
            </div>
          )}
        </form>

        {resultados && (
          <div className={styles.resultados} style={{ marginTop: '2.5rem' }}>
            {/* Header de Saludo */}
            <div className={styles.perfil} style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '0.75rem', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a', fontSize: '1.25rem' }}>Hola, {resultados.perfil.nombre_completo}</h3>
              <p style={{ margin: 0, color: '#64748b' }}>Aquí tienes el resumen ejecutivo en tiempo real de tu portafolio.</p>
            </div>

            {/* Layout a dos columnas para desktop */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
              
              {/* Columna Izquierda: Tarjetas de Métricas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1.5rem', backgroundColor: '#eff6ff', borderRadius: '0.75rem', border: '1px solid #bfdbfe' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e40af', marginBottom: '0.75rem' }}>
                    <Briefcase size={22} />
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Capital Activo Total</span>
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#1e3a8a' }}>
                    {formatCurrency(resultados.resumen.capital_todavia_adeudado)}
                  </div>
                </div>

                <div style={{ padding: '1.5rem', backgroundColor: '#f0fdf4', borderRadius: '0.75rem', border: '1px solid #bbf7d0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', marginBottom: '0.75rem' }}>
                    <DollarSign size={22} />
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ganancias Pagadas Históricas</span>
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#14532d' }}>
                    {formatCurrency(resultados.resumen.intereses_pagados)}
                  </div>
                </div>

                <div style={{ padding: '1.25rem', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569' }}>
                    <Percent size={20} />
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tasa Promedio del Portafolio</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#334155' }}>
                    {resultados.resumen.tasa_promedio}%
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Gráfico de Anillo */}
              <div style={{ backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#334155', fontSize: '1rem', fontWeight: '600', textAlign: 'center' }}>Distribución de tu Capital</h4>
                <div style={{ width: '100%', maxWidth: '280px', margin: '0 auto' }}>
                  <Doughnut data={chartData} options={chartOptions} />
                </div>
              </div>

            </div>

            {/* Nueva Sección: Historial de Últimos Pagos */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h3 style={{ marginBottom: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                <CalendarDays size={24} color="#64748b" />
                Historial de Últimos Pagos
              </h3>
              
              {(!resultados.ultimos_pagos || resultados.ultimos_pagos.length === 0) ? (
                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                  Aún no tienes registros de pagos recibidos.
                </div>
              ) : (
                <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <th style={{ padding: '1rem', fontWeight: '600', color: '#475569', fontSize: '0.875rem' }}>Fecha</th>
                        <th style={{ padding: '1rem', fontWeight: '600', color: '#475569', fontSize: '0.875rem' }}>Monto Pagado</th>
                        <th style={{ padding: '1rem', fontWeight: '600', color: '#475569', fontSize: '0.875rem' }}>Método</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultados.ultimos_pagos.map((pago, index) => (
                        <tr key={pago.id || index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '1rem', color: '#334155', fontSize: '0.875rem' }}>
                            {format(new Date(pago.fecha_operacion), "dd 'de' MMMM, yyyy", { locale: es })}
                          </td>
                          <td style={{ padding: '1rem', color: '#166534', fontWeight: '600', fontSize: '0.875rem' }}>
                            {formatCurrency(pago.monto_total)}
                          </td>
                          <td style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                            {pago.metodo_pago ? pago.metodo_pago.replace('_', ' ') : 'Transferencia'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Sección Original: Desglose de Inversiones */}
            <div className={styles.prestamos}>
              <h3 style={{ marginBottom: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                <FileText size={24} color="#64748b" />
                Inversiones Activas ({resultados.inversiones.length})
              </h3>
              {resultados.inversiones.length === 0 ? (
                <p className={styles.noData} style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '0.75rem', border: '1px dashed #cbd5e1' }}>No tienes inversiones activas</p>
              ) : (
                <div className={styles.prestamosList} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {resultados.inversiones.map((inv) => (
                    <div key={inv.id} className={styles.prestamoCard} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', backgroundColor: 'white', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ fontWeight: '700', color: '#1e293b', marginBottom: '0.25rem', fontSize: '1.125rem' }}>
                          Monto: {formatCurrency(inv.monto_invertido)}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', gap: '1rem' }}>
                          <span>Tasa: <strong style={{ color: '#334155' }}>{inv.tasa_interes_pactada}%</strong></span>
                          <span>Fecha de ingreso: <strong style={{ color: '#334155' }}>{format(new Date(inv.fecha_inversion), "dd MMM yyyy", { locale: es })}</strong></span>
                        </div>
                      </div>
                      <div>
                        <span style={{ 
                          padding: '0.375rem 1rem', 
                          borderRadius: '9999px', 
                          fontSize: '0.75rem', 
                          fontWeight: '700',
                          backgroundColor: inv.estado === 'activo' ? '#dcfce7' : '#f1f5f9',
                          color: inv.estado === 'activo' ? '#166534' : '#475569',
                          letterSpacing: '0.05em'
                        }}>
                          {inv.estado.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
