"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { prestamosApi, perfilesApi } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import styles from "./PrestamoForm.module.css";

export function PrestamoForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    perfil_id: "",
    monto_principal: "",
    tasa_interes_mensual: "3",
    plazo_meses: "12",
    fecha_inicio: new Date().toISOString().split("T")[0],
    fecha_vencimiento: "",
    frecuencia_pago: "mensual",
    metodo_pago: "efectivo",
    observaciones: "",
  });

  // Cargar clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setLoading(true);
        const response = await perfilesApi.getAll({ rol: "cliente" });
        setClientes(response.data?.data || []);
      } catch (err) {
        toast.error("Error al cargar clientes");
      } finally {
        setLoading(false);
      }
    };
    fetchClientes();
  }, []);

  // Calcular fecha de vencimiento automáticamente
  useEffect(() => {
    if (formData.fecha_inicio && formData.plazo_meses) {
      const fechaInicio = new Date(formData.fecha_inicio);
      const fechaVencimiento = new Date(fechaInicio);
      fechaVencimiento.setMonth(
        fechaVencimiento.getMonth() + parseInt(formData.plazo_meses),
      );
      setFormData((prev) => ({
        ...prev,
        fecha_vencimiento: fechaVencimiento.toISOString().split("T")[0],
      }));
    }
  }, [formData.fecha_inicio, formData.plazo_meses]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // Convertir montos a milunidades y mapear campos para el backend
      const dataToSend = {
        cliente_id: formData.perfil_id,
        monto_principal: parseFloat(formData.monto_principal) * 1000,
        tasa_interes_mensual: parseFloat(formData.tasa_interes_mensual),
        tasa_mora_diaria: 0.5,
        fecha_inicio: formData.fecha_inicio,
        fecha_vencimiento: formData.fecha_vencimiento,
        notas: formData.observaciones,
      };

      const response = await prestamosApi.create(dataToSend);

      if (response.data?.success) {
        toast.success("Préstamo creado exitosamente");
        router.push("/prestamos");
      } else {
        setError("Error al crear el préstamo");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Error al crear el préstamo";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Nuevo Préstamo</h1>
        <p className={styles.subtitle}>Completa los datos del préstamo</p>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          {/* Sección Cliente */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Cliente</h2>
            <div className={styles.field}>
              <label className={styles.label}>Seleccionar Cliente *</label>
              <select
                name="perfil_id"
                value={formData.perfil_id}
                onChange={handleChange}
                className={styles.select}
                required
                disabled={loading}
              >
                <option value="">
                  {loading ? "Cargando..." : "Seleccione un cliente"}
                </option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nombre_completo} - {cliente.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sección Monto e Intereses */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Monto e Intereses</h2>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Monto Principal ($) *</label>
                <input
                  type="number"
                  name="monto_principal"
                  value={formData.monto_principal}
                  onChange={handleChange}
                  placeholder="Ej: 5000000"
                  className={styles.input}
                  min="1"
                  required
                />
                <p className={styles.helper}>En pesos colombianos</p>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  Tasa Interés Mensual (%) *
                </label>
                <input
                  type="number"
                  name="tasa_interes_mensual"
                  value={formData.tasa_interes_mensual}
                  onChange={handleChange}
                  placeholder="Ej: 3"
                  className={styles.input}
                  min="0"
                  max="100"
                  step="0.1"
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Plazo (meses) *</label>
                <input
                  type="number"
                  name="plazo_meses"
                  value={formData.plazo_meses}
                  onChange={handleChange}
                  placeholder="Ej: 12"
                  className={styles.input}
                  min="1"
                  max="360"
                  required
                />
              </div>
            </div>
          </div>

          {/* Sección Fechas */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Fechas</h2>
            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label}>Fecha de Inicio *</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={formData.fecha_inicio}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Fecha de Vencimiento</label>
                <input
                  type="date"
                  name="fecha_vencimiento"
                  value={formData.fecha_vencimiento}
                  onChange={handleChange}
                  className={styles.input}
                  readOnly
                />
                <p className={styles.helper}>Calculada automáticamente</p>
              </div>
            </div>
          </div>

          {/* Sección Pagos */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Configuración de Pagos</h2>
            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label}>Frecuencia de Pago *</label>
                <select
                  name="frecuencia_pago"
                  value={formData.frecuencia_pago}
                  onChange={handleChange}
                  className={styles.select}
                  required
                >
                  <option value="mensual">Mensual</option>
                  <option value="quincenal">Quincenal</option>
                  <option value="semanal">Semanal</option>
                  <option value="diario">Diario</option>
                </select>
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
          </div>

          {/* Observaciones */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Observaciones</h2>
            <div className={styles.field}>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                placeholder="Notas adicionales sobre el préstamo..."
                className={styles.textarea}
                rows={3}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <Link href="/prestamos" className={styles.btnSecondary}>
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving || loading}
              className={styles.btnPrimary}
            >
              {saving ? "Creando..." : "Crear Préstamo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
