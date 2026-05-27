"use client";

import { useState } from "react";
import {
  Search,
  CreditCard,
  Briefcase,
  TrendingUp,
  DollarSign,
  AlertCircle,
  Activity
} from "lucide-react";
import { inversionesApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import styles from "../consulta/Consulta.module.css";

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

  return (
    <div className={styles.container}>
      <div className={styles.card} style={{ maxWidth: '800px' }}>
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
          <div className={styles.resultados} style={{ marginTop: '2rem' }}>
            <div className={styles.perfil} style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Hola, {resultados.perfil.nombre_completo}</h3>
              <p style={{ margin: 0, color: '#64748b' }}>Aquí tienes el resumen en tiempo real de tu portafolio.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ padding: '1.25rem', backgroundColor: '#eff6ff', borderRadius: '0.75rem', border: '1px solid #bfdbfe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e40af', marginBottom: '0.5rem' }}>
                  <Briefcase size={20} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase' }}>Capital Activo</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e3a8a' }}>
                  {formatCurrency(resultados.resumen.capital_todavia_adeudado)}
                </div>
              </div>

              <div style={{ padding: '1.25rem', backgroundColor: '#f0fdf4', borderRadius: '0.75rem', border: '1px solid #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', marginBottom: '0.5rem' }}>
                  <DollarSign size={20} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase' }}>Ganancias Pagadas</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#14532d' }}>
                  {formatCurrency(resultados.resumen.intereses_pagados)}
                </div>
              </div>

              <div style={{ padding: '1.25rem', backgroundColor: '#fef2f2', borderRadius: '0.75rem', border: '1px solid #fecaca' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991b1b', marginBottom: '0.5rem' }}>
                  <Activity size={20} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', textTransform: 'uppercase' }}>Interés Acumulado (Est.)</span>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7f1d1d' }}>
                  {formatCurrency(resultados.resumen.intereses_acumulados_estimados)}
                </div>
              </div>
            </div>

            <div className={styles.prestamos}>
              <h3 style={{ marginBottom: '1rem', color: '#0f172a' }}>Tus Inversiones ({resultados.inversiones.length})</h3>
              {resultados.inversiones.length === 0 ? (
                <p className={styles.noData}>No tienes inversiones activas</p>
              ) : (
                <div className={styles.prestamosList}>
                  {resultados.inversiones.map((inv) => (
                    <div key={inv.id} className={styles.prestamoCard} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#1e293b', marginBottom: '0.25rem' }}>
                          Monto: {formatCurrency(inv.monto_invertido)}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                          Tasa: {inv.tasa_interes_pactada}% | Fecha: {new Date(inv.fecha_inversion).toLocaleDateString()}
                        </div>
                      </div>
                      <div>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '9999px', 
                          fontSize: '0.75rem', 
                          fontWeight: '600',
                          backgroundColor: inv.estado === 'activo' ? '#dcfce7' : '#f1f5f9',
                          color: inv.estado === 'activo' ? '#166534' : '#475569'
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
