"use client";

import { useEffect, useState } from "react";
import { inversionesApi } from "@/lib/api";
import { Plus } from "lucide-react";
import Link from "next/link";
import styles from "../InversionistasView/InversionistasView.module.css";

export function InversionesView() {
  const [inversiones, setInversiones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInversiones = async () => {
      try {
        const { data } = await inversionesApi.getAll();
        setInversiones(data.data || []);
      } catch (error) {
        console.error("Error fetching inversiones:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInversiones();
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
          <h1>Inversiones</h1>
          <p className={styles.subtitle}>Gestiona las inversiones</p>
        </div>
        <Link href="/inversiones/nueva" className={styles.btnPrimary}>
          <Plus size={20} />
          Nueva Inversión
        </Link>
      </div>

      <div className={styles.tableContainer}>
        {inversiones.length === 0 ? (
          <p className={styles.emptyState}>No hay inversiones registradas</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Inversionista</th>
                <th>Monto</th>
                <th>Tasa</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inversiones.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.inversionista?.nombre_completo || "N/A"}</td>
                  <td>${(inv.monto_invertido / 1000).toLocaleString()}</td>
                  <td>{inv.tasa_interes_pactada}%</td>
                  <td>
                    <span className={`${styles.estado} ${styles[inv.estado]}`}>
                      {inv.estado}
                    </span>
                  </td>
                  <td>
                    {new Date(inv.fecha_inversion).toLocaleDateString("es-ES")}
                  </td>
                  <td>
                    <Link
                      href={`/inversiones/${inv.id}`}
                      className={styles.btnView}
                    >
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
