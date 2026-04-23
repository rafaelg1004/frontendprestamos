"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { perfilesApi } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import styles from "./ClienteForm.module.css";

export function ClienteForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nombre_completo: "",
    email: "",
    telefono: "",
    direccion: "",
    rol: "cliente",
    identificacion: "",
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
      const response = await perfilesApi.create(formData);

      if (response.data?.success) {
        toast.success("Cliente creado exitosamente");
        router.push("/clientes");
      } else {
        setError("Error al crear el cliente");
      }
    } catch (err) {
      const code = err.response?.data?.code;
      const backendMessage = err.response?.data?.message;

      let message = backendMessage || "Error al crear el cliente";

      // Mensajes amigables según el código de error
      switch (code) {
        case "EMAIL_EXISTS":
          message =
            "Ya existe un cliente con este email. Por favor, use otro email o verifique la lista de clientes.";
          break;
        case "PROFILE_EXISTS":
          message =
            "Este usuario ya tiene un perfil creado. Será redirigido a la lista de clientes.";
          toast.info("El cliente ya existe");
          setTimeout(() => router.push("/clientes"), 2000);
          break;
        case "AUTH_ERROR":
          message =
            "Error de autenticación al crear el usuario. Intente nuevamente.";
          break;
        default:
          message = backendMessage || "Error al crear el cliente";
      }

      setError(message);
      if (code !== "PROFILE_EXISTS") {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Nuevo Cliente</h1>
        <p className={styles.subtitle}>Completa los datos del cliente</p>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label className={styles.label}>Nombre completo *</label>
            <input
              type="text"
              name="nombre_completo"
              value={formData.nombre_completo}
              onChange={handleChange}
              placeholder="Ej: Juan Pérez"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@email.com"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ej: 3001234567"
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Identificación</label>
            <input
              type="text"
              name="identificacion"
              value={formData.identificacion}
              onChange={handleChange}
              placeholder="Ej: 1234567890"
              className={styles.input}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Dirección</label>
            <textarea
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Dirección completa..."
              className={styles.textarea}
              rows={3}
            />
          </div>

          <div className={styles.actions}>
            <Link href="/clientes" className={styles.btnSecondary}>
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={styles.btnPrimary}
            >
              {loading ? "Creando..." : "Crear Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
