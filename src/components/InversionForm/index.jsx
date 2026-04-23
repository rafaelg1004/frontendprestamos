"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { inversionesApi, perfilesApi } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import styles from "../PrestamoForm/PrestamoForm.module.css";

export function InversionForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inversionistas, setInversionistas] = useState([]);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    perfil_id: "",
    monto: "",
    tasa_interes_mensual: "2",
    fecha_inicio: new Date().toISOString().split("T")[0],
    observaciones: "",
  });

  // Cargar inversionistas
  useEffect(() => {
    const fetchInversionistas = async () => {
      try {
        setLoading(true);
        const response = await perfilesApi.getAll({ rol: "inversionista" });
        setInversionistas(response.data?.data || []);
      } catch (err) {
        toast.error("Error al cargar inversionistas");
      } finally {
        setLoading(false);
      }
    };
    fetchInversionistas();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // Mapear campos para el backend
      const dataToSend = {
        inversionista_id: formData.perfil_id,
        monto_invertido: parseFloat(formData.monto) * 1000,
        tasa_interes_pactada: parseFloat(formData.tasa_interes_mensual),
        notas: formData.observaciones,
      };

      const response = await inversionesApi.create(dataToSend);

      if (response.data?.success) {
        toast.success("Inversión creada exitosamente");
        router.push("/inversiones");
      } else {
        setError("Error al crear la inversión");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Error al crear la inversión";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Nueva Inversión</h1>
        <p className={styles.subtitle}>Registra una nueva inversión</p>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Inversionista</h2>
            <div className={styles.field}>
              <label className={styles.label}>
                Seleccionar Inversionista *
              </label>
              <select
                name="perfil_id"
                value={formData.perfil_id}
                onChange={handleChange}
                className={styles.select}
                required
                disabled={loading}
              >
                <option value="">
                  {loading ? "Cargando..." : "Seleccione un inversionista"}
                </option>
                {inversionistas.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.nombre_completo} - {inv.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Detalles de la Inversión</h2>
            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label}>Monto ($) *</label>
                <input
                  type="number"
                  name="monto"
                  value={formData.monto}
                  onChange={handleChange}
                  placeholder="Ej: 10000000"
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
                  placeholder="Ej: 2"
                  className={styles.input}
                  min="0"
                  step="0.1"
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Fecha</h2>
            <div className={styles.field}>
              <label className={styles.label}>Fecha de Registro *</label>
              <input
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Observaciones</h2>
            <div className={styles.field}>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                placeholder="Notas adicionales..."
                className={styles.textarea}
                rows={3}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <Link href="/inversiones" className={styles.btnSecondary}>
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving || loading}
              className={styles.btnPrimary}
            >
              {saving ? "Creando..." : "Crear Inversión"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
