"use client";

import { useEffect, useState } from "react";
import { inversionesApi, api } from "@/lib/api";
import { 
  Plus, 
  TrendingUp, 
  Calendar, 
  ArrowRight, 
  AlertTriangle,
  Activity,
  CheckCircle2,
  Clock,
  DollarSign
} from "lucide-react";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import styles from "./InversionesView.module.css";
import { InversionForm } from "../InversionForm";

export function InversionesView() {
  const [inversiones, setInversiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);


  const fetchInversiones = async () => {
    try {
      setLoading(true);
      const { data } = await inversionesApi.getAll();
      
      const dataWithDetails = await Promise.all(
        (data.data || []).map(async (inv) => {
          try {
            const detail = await inversionesApi.getById(inv.id);
            return detail.data?.data;
          } catch (e) {
            return inv;
          }
        })
      );
      
      setInversiones(dataWithDetails);
    } catch (error) {
      console.error("Error fetching inversiones:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInversiones();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Analizando inversiones y compromisos...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>Gestión de Inversiones</h1>
          <p className={styles.subtitle}>Control de capital y pagos de rendimientos</p>
        </div>
        <div className={styles.actions}>
          <button 
            onClick={() => setShowModal(true)} 
            className={styles.btnPrimary}
          >
            <Plus size={20} />
            Nueva Inversión
          </button>
        </div>
      </div>

      <InversionForm 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        onSuccess={fetchInversiones}
      />


      <div className={styles.grid}>
        {inversiones.length > 0 ? (
          inversiones.map((inv) => (
            <div key={inv.id} className={styles.card}>
              <div className={styles.cardMain}>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>
                    {inv.inversionista?.nombre_completo?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h3 className={styles.userName}>{inv.inversionista?.nombre_completo}</h3>
                      <span className={`${styles.badge} ${inv.estado === 'activo' || inv.estado === 'activa' ? styles.badgeSuccess : styles.badgeInfo}`}>
                        {inv.estado}
                      </span>
                    </div>
                    <p className={styles.userMeta}>Inversión #{inv.id.slice(0, 8)} · {formatDate(inv.fecha_inversion)}</p>
                  </div>
                </div>
                
                <div className={styles.stats}>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Interés Sugerido</span>
                    <span className={styles.statValue} style={{ color: inv.calculos?.en_mora ? '#ef4444' : '#1e293b' }}>
                      {formatCurrency(inv.calculos?.interes_sugerido || 0)}
                    </span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Disponible</span>
                    <span className={styles.statValue}>
                      {formatCurrency(inv.calculos?.disponible_en_cuenta || 0)}
                    </span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Cap. Pendiente</span>
                    <span className={styles.statValue}>
                      {formatCurrency(inv.calculos?.capital_pendiente || 0)}
                    </span>
                  </div>
                  <div className={styles.stat}>
                    <span className={styles.statLabel}>Tasa Mensual</span>
                    <span className={styles.statValue}>
                      {inv.tasa_interes_pactada}%
                    </span>
                  </div>
                </div>

                <div className={styles.footer}>
                  <div className={styles.nextPay}>
                    {inv.calculos?.en_mora ? (
                      <span style={{ color: '#dc2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={14} /> Vencido
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={14} /> {formatDate(inv.calculos?.proxima_fecha_pago)}
                      </span>
                    )}
                  </div>
                  <Link href={`/inversiones/${inv.id}`} className={styles.btnAction}>
                    Gestionar
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.empty}>
            <CheckCircle2 size={48} color="#10b981" />
            <p>No hay inversiones registradas aún.</p>
          </div>
        )}
      </div>
    </div>
  );
}
