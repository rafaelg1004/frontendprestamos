"use client";

import { useState } from "react";
import {
  Search,
  CreditCard,
  User,
  DollarSign,
  AlertCircle,
  Percent,
  CalendarDays,
  FileText,
  CheckCircle,
  Clock
} from "lucide-react";
import { prestamosApi } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import styles from "../consulta/Consulta.module.css";

export default function ConsultaPrestamoPage() {
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
      const response = await prestamosApi.getPublicByCedula(cedula);
      setResultados(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al consultar préstamos");
      toast.error("Error al consultar");
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      activo: { label: 'Activo', color: '#16a34a', bg: '#dcfce7' },
      mora: { label: 'En Mora', color: '#dc2626', bg: '#fee2e2' },
      pagado: { label: 'Pagado', color: '#2563eb', bg: '#dbeafe' },
    };
    return estados[estado] || { label: estado, color: '#64748b', bg: '#f1f5f9' };
  };

  return (
    <div className={styles.container}>
      <div className={styles.card} style={{ maxWidth: '900px' }}>
        <div className={styles.header}>
          <div className={styles.icon} style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}>
            <CreditCard size={32} />
          </div>
          <h1>Consulta tu Préstamo</h1>
          <p>Ingresa tu número de cédula para ver el estado de tus préstamos</p>
        </div>

        <form onSubmit={handleConsulta} className={styles.form}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              placeholder="Número de cédula"
              className={styles.input}
              required
            />
            <button 
              type="submit" 
              className={styles.button}
              disabled={loading}
            >
              {loading ? (
                "Consultando..."
              ) : (
                <>
                  <Search size={20} />
                  Consultar
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className={styles.error}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {resultados && (
          <div className={styles.results}>
            {/* Header con info del cliente */}
            <div className={styles.clientHeader}>
              <div className={styles.clientIcon}>
                <User size={40} />
              </div>
              <div className={styles.clientInfo}>
                <h2>{resultados.perfil.nombre}</h2>
                <p>CC: {resultados.perfil.identificacion}</p>
                {resultados.perfil.telefono && (
                  <p>Tel: {resultados.perfil.telefono}</p>
                )}
              </div>
            </div>

            {/* Resumen Financiero */}
            <div className={styles.summarySection}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <DollarSign size={20} />
                Resumen Financiero
              </h3>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryCard} style={{ borderLeft: '4px solid #dc2626' }}>
                  <div className={styles.summaryLabel}>Capital Prestado</div>
                  <div className={styles.summaryValue} style={{ color: '#dc2626' }}>
                    {formatCurrency(resultados.resumen.capital_inicial || 0)}
                  </div>
                </div>
                <div className={styles.summaryCard} style={{ borderLeft: '4px solid #16a34a' }}>
                  <div className={styles.summaryLabel}>Capital Pagado</div>
                  <div className={styles.summaryValue} style={{ color: '#16a34a' }}>
                    {formatCurrency(resultados.resumen.capital_pagado || 0)}
                  </div>
                </div>
                <div className={styles.summaryCard} style={{ borderLeft: '4px solid #f59e0b' }}>
                  <div className={styles.summaryLabel}>Capital Pendiente</div>
                  <div className={styles.summaryValue} style={{ color: '#f59e0b' }}>
                    {formatCurrency(resultados.resumen.capital_pendiente || 0)}
                  </div>
                </div>
                <div className={styles.summaryCard} style={{ borderLeft: '4px solid #3b82f6' }}>
                  <div className={styles.summaryLabel}>Intereses Pagados</div>
                  <div className={styles.summaryValue} style={{ color: '#3b82f6' }}>
                    {formatCurrency(resultados.resumen.intereses_pagados || 0)}
                  </div>
                </div>
                <div className={styles.summaryCard} style={{ borderLeft: '4px solid #8b5cf6' }}>
                  <div className={styles.summaryLabel}>Intereses Pendientes</div>
                  <div className={styles.summaryValue} style={{ color: '#8b5cf6' }}>
                    {formatCurrency(resultados.resumen.intereses_pendientes || 0)}
                  </div>
                </div>
                <div className={styles.summaryCard} style={{ borderLeft: '4px solid #06b6d4' }}>
                  <div className={styles.summaryLabel}>Tasa Promedio</div>
                  <div className={styles.summaryValue} style={{ color: '#06b6d4' }}>
                    {resultados.resumen.tasa_promedio || 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Préstamos */}
            <div className={styles.investmentsSection}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <FileText size={20} />
                Tus Préstamos ({resultados.total})
              </h3>
              
              {resultados.prestamos.map((prestamo, index) => {
                const estado = getEstadoBadge(prestamo.estado);
                return (
                  <div key={prestamo.id} className={styles.investmentCard}>
                    <div className={styles.investmentHeader}>
                      <div className={styles.investmentTitle}>
                        <span className={styles.investmentNumber}>#{index + 1}</span>
                        <span className={styles.investmentDate}>
                          <CalendarDays size={14} />
                          {formatDate(prestamo.fecha_inicio)}
                        </span>
                      </div>
                      <span 
                        className={styles.statusBadge}
                        style={{ 
                          backgroundColor: estado.bg,
                          color: estado.color
                        }}
                      >
                        {estado.label}
                      </span>
                    </div>

                    <div className={styles.investmentDetails}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Monto Inicial:</span>
                        <span className={styles.detailValue}>{formatCurrency(prestamo.monto_principal)}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Tasa Mensual:</span>
                        <span className={styles.detailValue}>{prestamo.tasa_interes_mensual}%</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Capital Pagado:</span>
                        <span className={styles.detailValue} style={{ color: '#16a34a' }}>
                          {formatCurrency(prestamo.capital_pagado || 0)}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Capital Pendiente:</span>
                        <span className={styles.detailValue} style={{ color: '#dc2626' }}>
                          {formatCurrency(prestamo.capital_pendiente || 0)}
                        </span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Intereses Pagados:</span>
                        <span className={styles.detailValue} style={{ color: '#3b82f6' }}>
                          {formatCurrency(prestamo.intereses_pagados || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Resumen visual */}
            <div className={styles.footerSummary}>
              <div className={styles.footerItem}>
                <CheckCircle size={20} color="#16a34a" />
                <span>Préstamos: {resultados.resumen.totalPrestamos}</span>
              </div>
              <div className={styles.footerItem}>
                <Clock size={20} color="#f59e0b" />
                <span>Activos: {resultados.resumen.prestamosActivos}</span>
              </div>
              <div className={styles.footerItem}>
                <AlertCircle size={20} color="#dc2626" />
                <span>En Mora: {resultados.resumen.prestamosMora}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
