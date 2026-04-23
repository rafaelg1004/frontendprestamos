"use client";

import { useEffect, useState } from "react";
import { perfilesApi, inversionesApi } from "@/lib/api";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import styles from "../ClienteDetalleView/ClienteDetalleView.module.css";

export function InversionistaDetalleView({ id }) {
  const [inversionista, setInversionista] = useState(null);
  const [inversiones, setInversiones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [inversionistaRes, inversionesRes] = await Promise.all([
          perfilesApi.getById(id),
          inversionesApi.getAll({ perfil_id: id }),
        ]);

        setInversionista(inversionistaRes.data?.data);
        setInversiones(inversionesRes.data?.data || []);
      } catch (error) {
        console.error("Error fetching inversionista:", error);
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

  if (!inversionista) {
    return (
      <div className={styles.container}>
        <p>Inversionista no encontrado</p>
        <Link href="/inversionistas" className={styles.link}>
          ← Volver a inversionistas
        </Link>
      </div>
    );
  }

  const inversionesActivas = inversiones.filter((i) => i.estado === "activa");
  const totalInvertido = inversiones.reduce((sum, i) => sum + i.monto, 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>{inversionista.nombre_completo}</h1>
          <p className={styles.subtitle}>Detalle del inversionista</p>
        </div>
        <div className={styles.actions}>
          <Link href="/inversionistas" className={styles.btnSecondary}>
            <ArrowLeft size={18} />
            Volver
          </Link>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Info del Inversionista */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div
              className={styles.avatar}
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              }}
            >
              <TrendingUp size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 600 }}>
                {inversionista.nombre_completo}
              </h2>
              <span
                className={styles.badge}
                style={{ background: "#d1fae5", color: "#065f46" }}
              >
                Inversionista
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
              <span className={styles.infoValue}>{inversionista.email}</span>
            </div>

            {inversionista.telefono && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>
                  <Phone
                    size={14}
                    style={{ display: "inline", marginRight: "4px" }}
                  />
                  Teléfono
                </span>
                <span className={styles.infoValue}>
                  {inversionista.telefono}
                </span>
              </div>
            )}

            {inversionista.direccion && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>
                  <MapPin
                    size={14}
                    style={{ display: "inline", marginRight: "4px" }}
                  />
                  Dirección
                </span>
                <span className={styles.infoValue}>
                  {inversionista.direccion}
                </span>
              </div>
            )}

            {inversionista.identificacion && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>
                  <FileText
                    size={14}
                    style={{ display: "inline", marginRight: "4px" }}
                  />
                  Identificación
                </span>
                <span className={styles.infoValue}>
                  {inversionista.identificacion}
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
                {formatDate(inversionista.fecha_registro)}
              </span>
            </div>
          </div>
        </div>

        {/* Inversiones */}
        <div className={styles.card}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <h2 className={styles.sectionTitle}>Inversiones</h2>
            <div style={{ display: "flex", gap: "1rem", fontSize: "0.875rem" }}>
              <span>
                <strong>{inversiones.length}</strong> total
              </span>
              <span>
                <strong>{inversionesActivas.length}</strong> activas
              </span>
            </div>
          </div>

          {inversiones.length === 0 ? (
            <p className={styles.emptyState}>No hay inversiones registradas</p>
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
                  {inversiones.map((inv) => (
                    <tr key={inv.id}>
                      <td>{formatCurrency(inv.monto)}</td>
                      <td>{inv.tasa_interes_mensual}%</td>
                      <td>
                        <span
                          className={`${styles.badge} ${
                            inv.estado === "activa"
                              ? styles.badgeSuccess
                              : inv.estado === "devuelta"
                                ? styles.badgeWarning
                                : styles.badgeDanger
                          }`}
                        >
                          {inv.estado}
                        </span>
                      </td>
                      <td>{formatDate(inv.fecha_inicio)}</td>
                      <td>{formatDate(inv.fecha_vencimiento)}</td>
                      <td>
                        <Link
                          href={`/inversiones/${inv.id}`}
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
              Total invertido: <strong>{formatCurrency(totalInvertido)}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
