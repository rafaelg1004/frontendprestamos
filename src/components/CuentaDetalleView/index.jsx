"use client";

import { useEffect, useState } from "react";
import { cuentasApi, movimientosApi } from "@/lib/api";
import {
  formatDate,
  formatCurrency,
  getTipoMovimientoLabel,
  getMetodoPagoLabel,
} from "@/lib/utils";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Wallet, Landmark, CreditCard, Banknote, RefreshCw, TrendingUp } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import styles from "./CuentaDetalleView.module.css";

export function CuentaDetalleView({ id }) {
  const [cuenta, setCuenta] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cuentaRes, movsRes] = await Promise.all([
        cuentasApi.getById(id),
        movimientosApi.getAll({ cuenta_id: id, limit: 1000 })
      ]);
      setCuenta(cuentaRes.data?.data);
      setMovimientos(movsRes.data?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error cargando detalles de la cuenta");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await cuentasApi.sincronizar(id);
      toast.success("Saldo sincronizado correctamente");
      fetchData();
    } catch (error) {
      toast.error("Error al sincronizar saldo");
    } finally {
      setSyncing(false);
    }
  };

  const getAccountIcon = (tipo) => {
    switch (tipo) {
      case 'efectivo': return <Banknote size={24} />;
      case 'digital': return <Landmark size={24} />;
      default: return <CreditCard size={24} />;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSkeleton} style={{ height: "150px", marginBottom: "1rem" }}></div>
        <div className={styles.loadingSkeleton} style={{ height: "400px" }}></div>
      </div>
    );
  }

  if (!cuenta) {
    return <div className={styles.container}>Cuenta no encontrada</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <Link href="/cuentas" className={styles.btnBack}>
            <ArrowLeft size={20} />
            Volver a Cuentas
          </Link>
          <h1 className={styles.title}>Detalle de Cuenta</h1>
        </div>
      </div>

      <div className={styles.cardInfo}>
        <div className={styles.cardHeader}>
          <div className={styles.iconWrapper}>
            {getAccountIcon(cuenta.tipo)}
          </div>
          <div>
            <h2 className={styles.accountName}>{cuenta.nombre}</h2>
            <span className={styles.accountType}>{cuenta.tipo}</span>
          </div>
        </div>
        <div className={styles.balanceSection}>
          <p className={styles.balanceLabel}>Saldo Actual</p>
          <div className={styles.balanceRow}>
            <p className={`${styles.balanceValue} ${cuenta.saldo_actual < 0 ? styles.negative : ''}`}>
              {formatCurrency(cuenta.saldo_actual)}
            </p>
            <button 
              onClick={handleSync}
              className={`${styles.btnSync} ${syncing ? styles.spinning : ''}`}
              title="Sincronizar saldo con movimientos"
              disabled={syncing}
            >
              <RefreshCw size={18} />
            </button>
          </div>
        </div>
      </div>

      {cuenta.rendimientos_por_inversion && cuenta.rendimientos_por_inversion.length > 0 && (
        <div className={styles.cardRendimientos}>
          <div className={styles.cardTitle}>
            <h3><TrendingUp size={18} /> Ganancias por Inversión</h3>
          </div>
          <div className={styles.rendimientosGrid}>
            {cuenta.rendimientos_por_inversion.map((rend) => (
              <div key={rend.inversion_id} className={styles.rendimientoCard}>
                <div className={styles.rendTitle}>Inversión #{rend.inversion_id.slice(0,8)}</div>
                <div className={styles.rendMonto}>
                  <span className={styles.rendLabel}>Invertido:</span> {formatCurrency(rend.monto_invertido)}
                </div>
                <div className={styles.rendGanancia}>
                  <span className={styles.rendLabel}>Ganado:</span> 
                  <span className={styles.amountPositive}>+{formatCurrency(rend.total_ganado)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.card}>
        <div className={styles.cardTitle}>
          <h3>Historial de Movimientos</h3>
        </div>

        {movimientos.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No hay movimientos registrados para esta cuenta</p>
          </div>
        ) : (
          <>
            <div className={styles.desktopView}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Monto</th>
                    <th>Referencia</th>
                    <th>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((mov) => {
                    const isEntrada = ["recibo_inversion", "pago_cliente", "ganancia_interes"].includes(mov.tipo);
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
                        <td className={`${styles.amount} ${isEntrada ? styles.amountPositive : styles.amountNegative}`}>
                          {isEntrada ? "+" : "-"} {formatCurrency(mov.monto_total)}
                        </td>
                        <td className={styles.refCell}>
                          {mov.prestamo?.id ? (
                            <span>Préstamo #{mov.prestamo.id.slice(0,8)}</span>
                          ) : mov.inversion?.id ? (
                            <span>Inversión #{mov.inversion.id.slice(0,8)}</span>
                          ) : '-'}
                        </td>
                        <td>{mov.notas || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className={styles.mobileView}>
              {movimientos.map((mov) => {
                const isEntrada = ["recibo_inversion", "pago_cliente", "ganancia_interes"].includes(mov.tipo);
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
                      <div className={styles.cardRef}>
                        {mov.prestamo?.id ? (
                          <span>Ref: #{mov.prestamo.id.slice(0,8)}</span>
                        ) : mov.inversion?.id ? (
                          <span>Ref: #{mov.inversion.id.slice(0,8)}</span>
                        ) : null}
                      </div>
                      {mov.notas && <p className={styles.mobileNotes}>{mov.notas}</p>}
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
