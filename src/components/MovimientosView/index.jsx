"use client";

import { useEffect, useState } from "react";
import { movimientosApi } from "@/lib/api";
import {
  formatDate,
  formatCurrency,
  getTipoMovimientoLabel,
  getMetodoPagoLabel,
} from "@/lib/utils";
import { ArrowUpRight, ArrowDownLeft, Download, Search, Filter } from "lucide-react";
import styles from "./MovimientosView.module.css";

export function MovimientosView() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovimientos = async () => {
      try {
        const { data } = await movimientosApi.getAll();
        setMovimientos(data.data || []);
      } catch (error) {
        console.error("Error fetching movimientos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovimientos();
  }, []);

  const exportToCSV = () => {
    if (movimientos.length === 0) return;

    const headers = ["Fecha", "Tipo", "Persona", "Monto", "Metodo"];
    const rows = movimientos.map((m) => [
      formatDate(m.fecha_operacion),
      getTipoMovimientoLabel(m.tipo),
      m.perfil?.nombre_completo || 'N/A',
      m.monto_total / 1000,
      getMetodoPagoLabel(m.metodo_pago),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `movimientos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <div className={styles.loadingSkeleton} style={{ width: "200px", height: '2rem' }}></div>
          </div>
        </div>
        <div className={styles.card}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.loadingSkeleton}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Movimientos</h1>
          <p className={styles.subtitle}>
            Historial detallado de todas las transacciones
          </p>
        </div>
        <button 
          onClick={exportToCSV}
          className={styles.btnSecondary}
          disabled={movimientos.length === 0}
        >
          <Download size={18} />
          Exportar Historial
        </button>
      </div>

      <div className={styles.card}>
        {movimientos.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay movimientos registrados en el sistema</p>
          </div>
        ) : (
          <>
            {/* Desktop View */}
            <div className={styles.desktopView}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo de Operación</th>
                    <th>Participante</th>
                    <th style={{ textAlign: 'right' }}>Monto</th>
                    <th>Método</th>
                    <th>Referencia</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((mov) => {
                    const isEntrada = mov.tipo === "recibo_inversion" || mov.tipo === "pago_cliente";
                    return (
                      <tr key={mov.id}>
                        <td>{formatDate(mov.fecha_operacion)}</td>
                        <td>
                          <div className={styles.typeCell}>
                            {isEntrada ? (
                              <ArrowDownLeft size={16} className={styles.amountPositive} />
                            ) : (
                              <ArrowUpRight size={16} className={styles.amountNegative} />
                            )}
                            <span>{getTipoMovimientoLabel(mov.tipo)}</span>
                          </div>
                        </td>
                        <td>{mov.perfil?.nombre_completo || 'Sistema'}</td>
                        <td className={`${styles.amount} ${isEntrada ? styles.amountPositive : styles.amountNegative}`}>
                          {isEntrada ? "+" : "-"} {formatCurrency(mov.monto_total)}
                        </td>
                        <td>{getMetodoPagoLabel(mov.metodo_pago)}</td>
                        <td className={styles.refCell}>
                          {mov.prestamo?.id ? (
                            <span>Préstamo <span className={styles.refId}>#{mov.prestamo.id.slice(0,8)}</span></span>
                          ) : mov.inversion?.id ? (
                            <span>Inversión <span className={styles.refId}>#{mov.inversion.id.slice(0,8)}</span></span>
                          ) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile View */}
            <div className={styles.mobileView}>
              {movimientos.map((mov) => {
                const isEntrada = mov.tipo === "recibo_inversion" || mov.tipo === "pago_cliente";
                return (
                  <div key={mov.id} className={styles.mobileCard}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardTypeInfo}>
                        <div className={`${styles.iconCircle} ${isEntrada ? styles.iconIn : styles.iconOut}`}>
                          {isEntrada ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                        </div>
                        <div>
                          <div className={styles.typeLabel}>{getTipoMovimientoLabel(mov.tipo)}</div>
                          <div className={styles.dateLabel}>{formatDate(mov.fecha_operacion)}</div>
                        </div>
                      </div>
                      <div className={`${styles.cardAmount} ${isEntrada ? styles.amountPositive : styles.amountNegative}`}>
                        {isEntrada ? "+" : "-"} {formatCurrency(mov.monto_total)}
                      </div>
                    </div>
                    
                    <div className={styles.cardBody}>
                      <div className={styles.personInfo}>
                        <span className={styles.personName}>{mov.perfil?.nombre_completo || 'Sistema'}</span>
                        <span className={styles.methodBadge}>{getMetodoPagoLabel(mov.metodo_pago)}</span>
                      </div>
                      <div className={styles.cardRef}>
                        {mov.prestamo?.id ? (
                          <span>Ref: #{mov.prestamo.id.slice(0,8)}</span>
                        ) : mov.inversion?.id ? (
                          <span>Ref: #{mov.inversion.id.slice(0,8)}</span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
