"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, DollarSign, Calculator, PiggyBank } from "lucide-react";
import { prestamosApi, movimientosApi } from "@/lib/api";
import toast from "react-hot-toast";
import styles from "./LiquidacionPage.module.css";

function formatCurrency(amount) {
  if (!amount && amount !== 0) return "-";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace("COP", "$");
}

export default function LiquidacionPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [liquidacion, setLiquidacion] = useState(null);
  const [prestamo, setPrestamo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener datos del préstamo
        const prestamoRes = await prestamosApi.getById(params.id);
        const prestamoData = prestamoRes.data?.data;
        setPrestamo(prestamoData);

        // Calcular liquidación
        const liquidacionRes = await prestamosApi.calcularLiquidacion(
          params.id,
        );
        setLiquidacion(liquidacionRes.data?.data);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Error cargando datos");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const handleLiquidar = async () => {
    if (
      !confirm(
        "¿Estás seguro de que deseas liquidar el préstamo? Esta acción no se puede deshacer.",
      )
    ) {
      return;
    }

    setProcesando(true);
    try {
      const dataToSend = {
        tipo: "pago_cliente",
        perfil_id: prestamo.cliente_id || prestamo.cliente?.id,
        prestamo_id: prestamo.id,
        monto_capital: liquidacion.saldo_capital_pendiente,
        monto_interes: liquidacion.interes_pendiente,
        monto_mora: liquidacion.mora || 0,
        monto_total: liquidacion.total_a_pagar,
        metodo_pago: "liquidacion",
        fecha_operacion: new Date().toISOString().split("T")[0],
        notas: `Liquidación anticipada del préstamo. Meses transcurridos: ${liquidacion.meses_transcurridos}`,
      };

      console.log("[FRONTEND] Datos a enviar:", dataToSend);
      console.log(
        "[FRONTEND] clienteId:",
        dataToSend.perfil_id,
        "prestamoId:",
        dataToSend.prestamo_id,
      );

      await movimientosApi.create(dataToSend);

      // Marcar préstamo como pagado
      await prestamosApi.pagar(prestamo.id, {
        monto_total: liquidacion.total_a_pagar,
        liquidacion_anticipada: true,
      });

      toast.success("Préstamo liquidado exitosamente");
      router.push(`/prestamos/${prestamo.id}`);
    } catch (error) {
      console.error("Error completo:", error);
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Error desconocido";
      toast.error(`Error: ${errorMsg}`);
    } finally {
      setProcesando(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando...</div>
      </div>
    );
  }

  if (!liquidacion || !prestamo) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>No se pudo cargar la información</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href={`/prestamos/${params.id}`} className={styles.btnBack}>
          <ArrowLeft size={20} />
          Volver al préstamo
        </Link>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1 className={styles.title}>💰 Liquidación de Préstamo</h1>
          <p className={styles.subtitle}>
            Pago anticipado con cálculo de intereses reales
          </p>
        </div>

        {/* Desglose */}
        <div className={styles.desglose}>
          <div className={styles.desgloseItem}>
            <span className={styles.label}>Saldo Capital Pendiente</span>
            <span className={styles.value}>
              {formatCurrency(liquidacion.saldo_capital_pendiente)}
            </span>
          </div>

          <div className={styles.desgloseItem}>
            <span className={styles.label}>
              <Calculator
                size={16}
                style={{ display: "inline", marginRight: "4px" }}
              />
              Interés Acumulado ({liquidacion.meses_transcurridos} mes
              {liquidacion.meses_transcurridos !== 1 ? "es" : ""})
            </span>
            <span className={styles.value}>
              {formatCurrency(liquidacion.interes_pendiente)}
            </span>
          </div>

          {liquidacion.mora > 0 && (
            <div className={styles.desgloseItem}>
              <span className={styles.label} style={{ color: "#dc2626" }}>
                Mora por atraso
              </span>
              <span className={styles.value} style={{ color: "#dc2626" }}>
                {formatCurrency(liquidacion.mora)}
              </span>
            </div>
          )}

          <div className={styles.separator}></div>

          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>
              <DollarSign
                size={20}
                style={{ display: "inline", marginRight: "4px" }}
              />
              TOTAL A PAGAR
            </span>
            <span className={styles.totalValue}>
              {formatCurrency(liquidacion.total_a_pagar)}
            </span>
          </div>
        </div>

        {/* Ahorro */}
        {liquidacion.ahorro_intereses > 0 && (
          <div className={styles.ahorroBox}>
            <PiggyBank size={24} />
            <div>
              <p className={styles.ahorroTitle}>¡Ahorro por pago anticipado!</p>
              <p className={styles.ahorroAmount}>
                {formatCurrency(liquidacion.ahorro_intereses)}
              </p>
              <p className={styles.ahorroText}>
                Estás pagando solo los intereses de los meses transcurridos, no
                hasta el vencimiento original.
              </p>
            </div>
          </div>
        )}

        {/* Botón de liquidar */}
        <div className={styles.actions}>
          <button
            onClick={handleLiquidar}
            disabled={procesando}
            className={styles.btnLiquidar}
          >
            {procesando
              ? "Procesando..."
              : `Pagar ${formatCurrency(liquidacion.total_a_pagar)} y Liquidar`}
          </button>
        </div>

        <p className={styles.disclaimer}>
          Al liquidar el préstamo anticipadamente, solo se cobran los intereses
          correspondientes a los {liquidacion.meses_transcurridos} meses
          transcurridos, no los intereses proyectados hasta la fecha de
          vencimiento original.
        </p>
      </div>
    </div>
  );
}
