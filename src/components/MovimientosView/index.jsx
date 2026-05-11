"use client";

import { useEffect, useState } from "react";
import { movimientosApi } from "@/lib/api";
import {
  formatDate,
  formatCurrency,
  getTipoMovimientoLabel,
  getMetodoPagoLabel,
} from "@/lib/utils";
import { ArrowUpRight, ArrowDownLeft, Download } from "lucide-react";
import styles from "../InversionistasView/InversionistasView.module.css";

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
          <div>
            <div
              className={styles.loadingSkeleton}
              style={{ width: "200px" }}
            ></div>
          </div>
        </div>
        <div className={styles.card}>
          {[...Array(5)].map((_, i) => (
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
            Historial de transacciones (solo vista)
          </p>
        </div>
        <button 
          onClick={exportToCSV}
          className={styles.btnSecondary}
          disabled={movimientos.length === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          <Download size={18} />
          Exportar CSV
        </button>
      </div>

      <div className={styles.card}>
        {movimientos.length === 0 ? (
          <p className={styles.emptyState}>No hay movimientos registrados</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "0.75rem",
                      fontSize: "0.75rem",
                      color: "#6b7280",
                    }}
                  >
                    Fecha
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "0.75rem",
                      fontSize: "0.75rem",
                      color: "#6b7280",
                    }}
                  >
                    Tipo
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "0.75rem",
                      fontSize: "0.75rem",
                      color: "#6b7280",
                    }}
                  >
                    Persona
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "0.75rem",
                      fontSize: "0.75rem",
                      color: "#6b7280",
                    }}
                  >
                    Monto
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "0.75rem",
                      fontSize: "0.75rem",
                      color: "#6b7280",
                    }}
                  >
                    Método
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "0.75rem",
                      fontSize: "0.75rem",
                      color: "#6b7280",
                    }}
                  >
                    Préstamo Ref.
                  </th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((mov) => {
                  const isEntrada =
                    mov.tipo === "recibo_inversion" ||
                    mov.tipo === "pago_cliente";
                  return (
                    <tr
                      key={mov.id}
                      style={{ borderBottom: "1px solid #f3f4f6" }}
                    >
                      <td style={{ padding: "0.75rem", fontSize: "0.875rem" }}>
                        {formatDate(mov.fecha_operacion)}
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          {isEntrada ? (
                            <ArrowDownLeft size={16} color="#16a34a" />
                          ) : (
                            <ArrowUpRight size={16} color="#dc2626" />
                          )}
                          <span style={{ fontSize: "0.875rem" }}>
                            {getTipoMovimientoLabel(mov.tipo)}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "0.75rem", fontSize: "0.875rem" }}>
                        {mov.perfil?.nombre_completo || 'N/A'}
                      </td>
                      <td
                        style={{
                          padding: "0.75rem",
                          fontSize: "0.875rem",
                          textAlign: "right",
                          fontWeight: 600,
                          color: isEntrada ? "#16a34a" : "#dc2626",
                        }}
                      >
                        {isEntrada ? "+" : "-"}
                        {formatCurrency(mov.monto_total)}
                      </td>
                      <td style={{ padding: "0.75rem", fontSize: "0.875rem" }}>
                        {getMetodoPagoLabel(mov.metodo_pago)}
                      </td>
                      <td style={{ padding: "0.75rem", fontSize: "0.75rem", color: "#6b7280" }}>
                        {mov.prestamo?.id ? (
                          <div>
                            <div>#{mov.prestamo.id.slice(0,8)}</div>
                            <div style={{ fontSize: '0.7rem' }}>{formatCurrency(mov.prestamo.monto_principal)}</div>
                          </div>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
