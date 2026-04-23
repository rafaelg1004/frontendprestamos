"use client";

import { useEffect, useState } from "react";
import { perfilesApi, prestamosApi } from "@/lib/api";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
} from "lucide-react";
import Link from "next/link";
import styles from "./ClienteDetalleView.module.css";

export function ClienteDetalleView({ id }) {
  const [cliente, setCliente] = useState(null);
  const [prestamos, setPrestamos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [clienteRes, prestamosRes] = await Promise.all([
          perfilesApi.getById(id),
          prestamosApi.getAll({ perfil_id: id }),
        ]);

        setCliente(clienteRes.data?.data);
        setPrestamos(prestamosRes.data?.data || []);
      } catch (error) {
        console.error("Error fetching cliente:", error);
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

  if (!cliente) {
    return (
      <div className={styles.container}>
        <p>Cliente no encontrado</p>
        <Link href="/clientes" className={styles.link}>
          ← Volver a clientes
        </Link>
      </div>
    );
  }

  const prestamosActivos = prestamos.filter((p) => p.estado === "activo");
  const totalPrestamos = prestamos.reduce(
    (sum, p) => sum + p.monto_principal,
    0,
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>{cliente.nombre_completo}</h1>
          <p className={styles.subtitle}>Detalle del cliente</p>
        </div>
        <div className={styles.actions}>
          <Link href="/clientes" className={styles.btnSecondary}>
            <ArrowLeft size={18} />
            Volver
          </Link>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Info del Cliente */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.avatar}>
              {cliente.nombre_completo?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 600 }}>
                {cliente.nombre_completo}
              </h2>
              <span className={styles.badge + " " + styles.badgeSuccess}>
                Cliente
              </span>
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                <Mail
                  size={14}
                  style={{ display: "inline", marginRight: "4px" }}
                />
                Email
              </span>
              <span className={styles.infoValue}>{cliente.email}</span>
            </div>

            {cliente.telefono && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>
                  <Phone
                    size={14}
                    style={{ display: "inline", marginRight: "4px" }}
                  />
                  Teléfono
                </span>
                <span className={styles.infoValue}>{cliente.telefono}</span>
              </div>
            )}

            {cliente.direccion && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>
                  <MapPin
                    size={14}
                    style={{ display: "inline", marginRight: "4px" }}
                  />
                  Dirección
                </span>
                <span className={styles.infoValue}>{cliente.direccion}</span>
              </div>
            )}

            {cliente.identificacion && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>
                  <FileText
                    size={14}
                    style={{ display: "inline", marginRight: "4px" }}
                  />
                  Identificación
                </span>
                <span className={styles.infoValue}>
                  {cliente.identificacion}
                </span>
              </div>
            )}

            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                <Calendar
                  size={14}
                  style={{ display: "inline", marginRight: "4px" }}
                />
                Fecha de Registro
              </span>
              <span className={styles.infoValue}>
                {formatDate(cliente.fecha_registro)}
              </span>
            </div>
          </div>
        </div>

        {/* Préstamos */}
        <div className={styles.card}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <h2 className={styles.sectionTitle}>Préstamos</h2>
            <div style={{ display: "flex", gap: "1rem", fontSize: "0.875rem" }}>
              <span>
                <strong>{prestamos.length}</strong> total
              </span>
              <span>
                <strong>{prestamosActivos.length}</strong> activos
              </span>
            </div>
          </div>

          {prestamos.length === 0 ? (
            <p className={styles.emptyState}>No hay préstamos registrados</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Monto</th>
                    <th>Tasa</th>
                    <th>Estado</th>
                    <th>Inicio</th>
                    <th>Vencimiento</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {prestamos.map((prestamo) => (
                    <tr key={prestamo.id}>
                      <td>{formatCurrency(prestamo.monto_principal)}</td>
                      <td>{prestamo.tasa_interes_mensual}%</td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            prestamo.estado === "activo"
                              ? styles.badgeSuccess
                              : prestamo.estado === "mora"
                                ? styles.badgeDanger
                                : styles.badgeWarning
                          }`}
                        >
                          {prestamo.estado}
                        </span>
                      </td>
                      <td>{formatDate(prestamo.fecha_inicio)}</td>
                      <td>{formatDate(prestamo.fecha_vencimiento)}</td>
                      <td>
                        <Link
                          href={`/prestamos/${prestamo.id}`}
                          className={styles.link}
                        >
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div
            style={{
              marginTop: "1rem",
              paddingTop: "1rem",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>
              Total en préstamos:{" "}
              <strong>{formatCurrency(totalPrestamos)}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
