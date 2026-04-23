"use client";

import { useEffect, useState } from "react";
import { inversionesApi, perfilesApi } from "@/lib/api";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  Calendar,
  Percent,
  Clock,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import styles from "../PrestamoDetalleView/PrestamoDetalleView.module.css";

export function InversionDetalleView({ id }) {
  const [inversion, setInversion] = useState(null);
  const [inversionista, setInversionista] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const inversionRes = await inversionesApi.getById(id);
        const inversionData = inversionRes.data?.data;
        setInversion(inversionData);

        if (inversionData?.inversionista_id) {
          const perfilRes = await perfilesApi.getById(
            inversionData.inversionista_id,
          );
          setInversionista(perfilRes.data?.data);
        }
      } catch (error) {
        console.error("Error fetching inversion:", error);
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

  if (!inversion) {
    return (
      <div className={styles.container}>
        <p>Inversión no encontrada</p>
        <Link href="/inversiones" className={styles.link}>
          ← Volver a inversiones
        </Link>
      </div>
    );
  }

  const getBadgeClass = (estado) => {
    switch (estado) {
      case "activa":
        return styles.badgeSuccess;
      case "devuelta":
        return styles.badgeWarning;
      case "cancelada":
        return styles.badgeDanger;
      default:
        return styles.badgeWarning;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Inversión #{inversion.id?.slice(0, 8)}</h1>
          <p className={styles.subtitle}>Detalle de la inversión</p>
        </div>
        <div className={styles.actions}>
          <Link href="/inversiones" className={styles.btnSecondary}>
            <ArrowLeft size={18} />
            Volver
          </Link>
          {inversion.estado === "activa" && (
            <Link
              href={`/inversiones/${inversion.id}/devolucion`}
              className={styles.btnPrimary}
            >
              Registrar Devolución
            </Link>
          )}
        </div>
      </div>

      {/* Info del Inversionista - Primero (compacto) */}
      <div className={styles.card} style={{ marginBottom: "1rem" }}>
        <div className={styles.cardHeader}>
          <h2 className={styles.sectionTitle}>Inversionista</h2>
        </div>

        {inversionista ? (
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
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "white",
                }}
              >
                {inversionista.nombre_completo?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: "1rem" }}>
                  {inversionista.nombre_completo}
                </p>
                <Link
                  href={`/inversionistas/${inversionista.id}`}
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
                <span className={styles.infoValue}>{inversionista.email}</span>
              </div>
              {inversionista.telefono && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Teléfono</span>
                  <span className={styles.infoValue}>
                    {inversionista.telefono}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className={styles.emptyState}>
            Información del inversionista no disponible
          </p>
        )}
      </div>

      {/* Info de la Inversión - Fila compacta */}
      <div className={styles.infoBar}>
        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Monto</span>
          <span className={styles.infoBarValue}>
            {formatCurrency(inversion.monto_invertido)}
          </span>
        </div>
        <div className={styles.infoBarSeparator}></div>

        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Saldo</span>
          <span className={styles.infoBarValue}>
            {formatCurrency(
              inversion.saldo_pendiente || inversion.monto_invertido,
            )}
          </span>
        </div>
        <div className={styles.infoBarSeparator}></div>

        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Tasa</span>
          <span className={styles.infoBarValue}>
            {inversion.tasa_interes_pactada || inversion.tasa_interes_mensual}%
          </span>
        </div>
        <div className={styles.infoBarSeparator}></div>

        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Plazo</span>
          <span className={styles.infoBarValue}>
            {inversion.plazo_meses} meses
          </span>
        </div>
        <div className={styles.infoBarSeparator}></div>

        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Inicio</span>
          <span className={styles.infoBarValue}>
            {formatDate(inversion.fecha_inversion || inversion.fecha_inicio)}
          </span>
        </div>
        <div className={styles.infoBarSeparator}></div>

        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Vence</span>
          <span className={styles.infoBarValue}>
            {formatDate(inversion.fecha_vencimiento)}
          </span>
        </div>
      </div>

      {/* Historial de Movimientos */}
      {inversion.movimientos && inversion.movimientos.length > 0 && (
        <div className={styles.card} style={{ marginTop: "1.5rem" }}>
          <div className={styles.cardHeader}>
            <h2 className={styles.sectionTitle}>Historial de Movimientos</h2>
          </div>
          {inversion.movimientos.map((mov) => (
            <div key={mov.id} className={styles.movementItem}>
              <div
                className={styles.movementIcon}
                style={{ background: "#dcfce7" }}
              >
                <TrendingUp size={16} color="#16a34a" />
              </div>
              <div className={styles.movementInfo}>
                <p className={styles.movementTitle}>
                  {mov.tipo === "devolucion_inversion"
                    ? "Devolución"
                    : mov.tipo}
                </p>
                <p className={styles.movementDate}>
                  {formatDate(mov.fecha_operacion)}
                </p>
              </div>
              <div
                className={styles.movementAmount}
                style={{ color: "#16a34a" }}
              >
                +{formatCurrency(mov.monto_total)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
