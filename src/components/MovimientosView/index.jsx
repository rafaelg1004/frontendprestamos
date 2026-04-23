"use client";

import { useEffect, useState } from "react";
import { movimientosApi } from "@/lib/api";
import {
  formatDate,
  formatCurrency,
  getTipoMovimientoLabel,
  getMetodoPagoLabel,
} from "@/lib/utils";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
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
                </tr>
              </thead>
              <tbody>
                {movimientos.map((mov) => {
                  const isEntrada =
                    mov.tipo_movimiento === "recibo_inversion" ||
                    mov.tipo_movimiento === "pago_cliente";
                  return (
                    <tr
                      key={mov.movimiento_id}
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
                            {getTipoMovimientoLabel(mov.tipo_movimiento)}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "0.75rem", fontSize: "0.875rem" }}>
                        {mov.nombre_perfil}
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
