"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { movimientosApi } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import styles from "./RegistroPagoForm.module.css";

export function RegistroPagoForm({ prestamoId, clienteId, tipo = "prestamo" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    monto_capital: "",
    monto_interes: "",
    metodo_pago: "efectivo",
    fecha_operacion: new Date().toISOString().split("T")[0],
    observaciones: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const montoCapital = parseFloat(formData.monto_capital) || 0;
      const montoInteres = parseFloat(formData.monto_interes) || 0;

      if (montoCapital === 0 && montoInteres === 0) {
        setError("Debe ingresar al menos un monto (capital o interés)");
        setLoading(false);
        return;
      }

      const dataToSend = {
        tipo: tipo === "prestamo" ? "pago_cliente" : "devolucion_inversion",
        perfil_id: clienteId,
        prestamo_id: tipo === "prestamo" ? prestamoId : undefined,
        inversion_id: tipo === "inversion" ? prestamoId : undefined,
        monto_capital: montoCapital * 1000,
        monto_interes: montoInteres * 1000,
        monto_total: (montoCapital + montoInteres) * 1000,
        metodo_pago: formData.metodo_pago,
        fecha_operacion: formData.fecha_operacion,
        notas: formData.observaciones,
      };

      console.log("[FRONTEND] Datos a enviar:", dataToSend);
      console.log(
        "[FRONTEND] clienteId:",
        clienteId,
        "prestamoId:",
        prestamoId,
      );

      const response = await movimientosApi.create(dataToSend);

      if (response.data?.success) {
        toast.success("Pago registrado exitosamente");
        router.push(
          tipo === "prestamo"
            ? `/prestamos/${prestamoId}`
            : `/inversiones/${prestamoId}`,
        );
      } else {
        setError("Error al registrar el pago");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Error al registrar el pago";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const total =
    (parseFloat(formData.monto_capital) || 0) +
    (parseFloat(formData.monto_interes) || 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Registrar {tipo === "prestamo" ? "Pago" : "Devolución"}</h1>
        <p className={styles.subtitle}>
          Puede registrar solo capital, solo intereses o ambos
        </p>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Monto Capital ($)</label>
              <input
                type="number"
                name="monto_capital"
                value={formData.monto_capital}
                onChange={handleChange}
                placeholder="Ej: 500000"
                className={styles.input}
                min="0"
              />
              <p className={styles.helper}>Dejar en 0 si no aplica</p>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Monto Interés ($)</label>
              <input
                type="number"
                name="monto_interes"
                value={formData.monto_interes}
                onChange={handleChange}
                placeholder="Ej: 50000"
                className={styles.input}
                min="0"
              />
              <p className={styles.helper}>Dejar en 0 si no aplica</p>
            </div>
          </div>

          <div
            className={styles.field}
            style={{
              background: "#f9fafb",
              padding: "1rem",
              borderRadius: "0.5rem",
            }}
          >
            <label className={styles.label}>Total a Registrar</label>
            <input
              type="text"
              value={`$${total.toLocaleString()}`}
              className={styles.input}
              readOnly
              style={{ fontWeight: 600, fontSize: "1.125rem" }}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Fecha *</label>
              <input
                type="date"
                name="fecha_operacion"
                value={formData.fecha_operacion}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Método de Pago *</label>
              <select
                name="metodo_pago"
                value={formData.metodo_pago}
                onChange={handleChange}
                className={styles.select}
                required
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Observaciones</label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleChange}
              placeholder="Notas adicionales..."
              className={styles.textarea}
              rows={3}
            />
          </div>

          <div className={styles.actions}>
            <Link
              href={
                tipo === "prestamo"
                  ? `/prestamos/${prestamoId}`
                  : `/inversiones/${prestamoId}`
              }
              className={styles.btnSecondary}
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={styles.btnPrimary}
            >
              {loading ? "Registrando..." : "Registrar Pago"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
