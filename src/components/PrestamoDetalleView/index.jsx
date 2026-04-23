"use client";

import { useEffect, useState } from "react";
import { prestamosApi, perfilesApi } from "@/lib/api";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  Calendar,
  Percent,
  Clock,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import styles from "./PrestamoDetalleView.module.css";

export function PrestamoDetalleView({ id }) {
  const [prestamo, setPrestamo] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const prestamoRes = await prestamosApi.getById(id);
        const prestamoData = prestamoRes.data?.data;
        setPrestamo(prestamoData);

        // El cliente viene incluido en la respuesta del backend
        if (prestamoData?.cliente) {
          setCliente(prestamoData.cliente);
        } else if (prestamoData?.cliente_id) {
          // Fallback: hacer fetch si no viene incluido
          const clienteRes = await perfilesApi.getById(prestamoData.cliente_id);
          setCliente(clienteRes.data?.data);
        }
      } catch (error) {
        console.error("Error fetching prestamo:", error);
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

  if (!prestamo) {
    return (
      <div className={styles.container}>
        <p>Préstamo no encontrado</p>
        <Link href="/prestamos" className={styles.link}>
          ← Volver a préstamos
        </Link>
      </div>
    );
  }

  const getBadgeClass = (estado) => {
    switch (estado) {
      case "activo":
        return styles.badgeSuccess;
      case "pagado":
        return styles.badgeSuccess;
      case "mora":
        return styles.badgeDanger;
      default:
        return styles.badgeWarning;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Préstamo #{prestamo.id?.slice(0, 8)}</h1>
          <p className={styles.subtitle}>Detalle del préstamo</p>
        </div>
        <div className={styles.actions}>
          <Link href="/prestamos" className={styles.btnSecondary}>
            <ArrowLeft size={18} />
            Volver
          </Link>
          {prestamo.estado === "activo" && (
            <>
              <Link
                href={`/prestamos/${prestamo.id}/pago`}
                className={styles.btnPrimary}
              >
                Registrar Pago
              </Link>
              <Link
                href={`/prestamos/${prestamo.id}/liquidacion`}
                className={styles.btnSecondary}
              >
                💰 Liquidar Préstamo
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Info del Cliente - Primero */}
      <div className={styles.card} style={{ marginBottom: "1rem" }}>
        <div className={styles.cardHeader}>
          <h2 className={styles.sectionTitle}>Cliente</h2>
        </div>

        {cliente ? (
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
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "white",
                }}
              >
                {cliente.nombre_completo?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: "1rem" }}>
                  {cliente.nombre_completo}
                </p>
                <Link
                  href={`/clientes/${cliente.id}`}
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
                <span className={styles.infoValue}>{cliente.email}</span>
              </div>
              {cliente.telefono && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Teléfono</span>
                  <span className={styles.infoValue}>{cliente.telefono}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className={styles.emptyState}>
            Información del cliente no disponible
          </p>
        )}

        {prestamo.observaciones && (
          <div
            style={{
              marginTop: "1.5rem",
              paddingTop: "1rem",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <h3
              style={{
                margin: "0 0 0.5rem 0",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              Observaciones
            </h3>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#4b5563" }}>
              {prestamo.observaciones}
            </p>
          </div>
        )}
      </div>

      {/* Info del Préstamo - Fila compacta (después del cliente) */}
      <div className={styles.infoBar}>
        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Monto</span>
          <span className={styles.infoBarValue}>
            {formatCurrency(prestamo.monto_principal)}
          </span>
        </div>
        <div className={styles.infoBarSeparator}></div>

        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Cuota</span>
          <span className={styles.infoBarValue}>
            {formatCurrency(prestamo.calculos?.cuota_mensual)}
          </span>
        </div>
        <div className={styles.infoBarSeparator}></div>

        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Saldo</span>
          <span className={styles.infoBarValue}>
            {formatCurrency(
              prestamo.calculos?.saldo_pendiente ?? prestamo.monto_principal,
            )}
          </span>
        </div>
        <div className={styles.infoBarSeparator}></div>

        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Tasa</span>
          <span className={styles.infoBarValue}>
            {prestamo.tasa_interes_mensual}%
          </span>
        </div>
        <div className={styles.infoBarSeparator}></div>

        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Plazo</span>
          <span className={styles.infoBarValue}>
            {prestamo.plazo_meses
              ? `${prestamo.plazo_meses} meses`
              : prestamo.fecha_inicio && prestamo.fecha_vencimiento
                ? `${Math.ceil((new Date(prestamo.fecha_vencimiento) - new Date(prestamo.fecha_inicio)) / (1000 * 60 * 60 * 24 * 30))} meses`
                : "N/A"}
          </span>
        </div>
        <div className={styles.infoBarSeparator}></div>

        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Inicio</span>
          <span className={styles.infoBarValue}>
            {formatDate(prestamo.fecha_inicio)}
          </span>
        </div>
        <div className={styles.infoBarSeparator}></div>

        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Vence</span>
          <span className={styles.infoBarValue}>
            {formatDate(prestamo.fecha_vencimiento)}
          </span>
        </div>
      </div>

      {/* Historial de Movimientos */}
      <div className={styles.card} style={{ marginTop: "1.5rem" }}>
        <div className={styles.cardHeader}>
          <h2 className={styles.sectionTitle}>Historial de Movimientos</h2>
        </div>

        {/* Entrega del préstamo */}
        <div className={styles.movementItem}>
          <div
            className={styles.movementIcon}
            style={{ background: "#dcfce7", color: "#16a34a" }}
          >
            <DollarSign size={20} />
          </div>
          <div className={styles.movementInfo}>
            <p className={styles.movementTitle}>Entrega de Préstamo</p>
            <p className={styles.movementDate}>
              {formatDate(prestamo.fecha_inicio)}
            </p>
          </div>
          <div className={styles.movementAmount}>
            <span style={{ color: "#dc2626" }}>
              -{formatCurrency(prestamo.monto_principal)}
            </span>
          </div>
        </div>

        {/* Pagos realizados */}
        {prestamo.movimientos &&
        prestamo.movimientos.filter((m) => m.tipo === "pago_cliente").length >
          0 ? (
          prestamo.movimientos
            .filter((m) => m.tipo === "pago_cliente")
            .map((mov, index) => (
              <div key={mov.id || index} className={styles.movementItem}>
                <div
                  className={styles.movementIcon}
                  style={{ background: "#dbeafe", color: "#2563eb" }}
                >
                  <DollarSign size={20} />
                </div>
                <div className={styles.movementInfo}>
                  <p className={styles.movementTitle}>Pago Recibido</p>
                  <p className={styles.movementDate}>
                    {formatDate(mov.fecha_operacion)}
                  </p>
                  {mov.notas && (
                    <p className={styles.movementNotes}>{mov.notas}</p>
                  )}
                </div>
                <div className={styles.movementAmount}>
                  <span style={{ color: "#16a34a" }}>
                    +{formatCurrency(mov.monto_total)}
                  </span>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#6b7280",
                      marginTop: "2px",
                    }}
                  >
                    Capital: {formatCurrency(mov.monto_capital || 0)}
                    {mov.monto_interes > 0 &&
                      ` | Interés: ${formatCurrency(mov.monto_interes)}`}
                  </div>
                </div>
              </div>
            ))
        ) : (
          <div className={styles.emptyMovements}>
            <p style={{ color: "#6b7280", margin: 0 }}>
              No hay pagos registrados aún
            </p>
          </div>
        )}

        {/* Tabla de Cuotas */}
        {prestamo.cuotas && prestamo.cuotas.length > 0 && (
          <div
            className={styles.amortizationTable}
            style={{ marginTop: "1.5rem" }}
          >
            <h3
              style={{
                margin: "0 0 1rem 0",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              Plan de Pagos (Cuotas)
            </h3>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Vencimiento</th>
                    <th>Capital</th>
                    <th>Interés</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Pagado</th>
                  </tr>
                </thead>
                <tbody>
                  {prestamo.cuotas
                    .sort((a, b) => a.numero_cuota - b.numero_cuota)
                    .map((cuota) => (
                      <tr key={cuota.id} className={styles[cuota.estado]}>
                        <td>{cuota.numero_cuota}</td>
                        <td>
                          {new Date(cuota.fecha_vencimiento).toLocaleDateString(
                            "es-ES",
                          )}
                        </td>
                        <td>{formatCurrency(cuota.capital)}</td>
                        <td>{formatCurrency(cuota.interes)}</td>
                        <td>{formatCurrency(cuota.total_cuota)}</td>
                        <td>
                          <span
                            className={`${styles.estadoBadge} ${styles[cuota.estado]}`}
                          >
                            {cuota.estado === "pendiente" && "⏳ Pendiente"}
                            {cuota.estado === "pagado" && "✅ Pagado"}
                            {cuota.estado === "parcial" && "⚡ Parcial"}
                          </span>
                        </td>
                        <td>
                          {cuota.monto_pagado > 0
                            ? formatCurrency(cuota.monto_pagado)
                            : "-"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Resumen de saldo */}
        <div className={styles.saldoResumen}>
          <div className={styles.saldoRow}>
            <span>Total Prestado:</span>
            <span>{formatCurrency(prestamo.monto_principal)}</span>
          </div>
          <div className={styles.saldoRow}>
            <span>Capital Pagado:</span>
            <span style={{ color: "#16a34a" }}>
              {formatCurrency(prestamo.calculos?.capital_pagado || 0)}
            </span>
          </div>
          <div className={styles.saldoRow}>
            <span>Interés Pagado:</span>
            <span style={{ color: "#16a34a" }}>
              {formatCurrency(prestamo.calculos?.interes_pagado || 0)}
            </span>
          </div>
          <div
            className={styles.saldoRow}
            style={{
              borderTop: "2px solid #e5e7eb",
              paddingTop: "0.5rem",
              marginTop: "0.5rem",
              fontWeight: 600,
            }}
          >
            <span>Saldo Capital Pendiente:</span>
            <span
              style={{
                color:
                  (prestamo.calculos?.saldo_pendiente || 0) > 0
                    ? "#dc2626"
                    : "#16a34a",
              }}
            >
              {formatCurrency(
                prestamo.calculos?.saldo_pendiente ?? prestamo.monto_principal,
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
