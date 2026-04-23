"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { perfilesApi } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import { Users, User, TrendingUp } from "lucide-react";
import styles from "./PersonaForm.module.css";

export function PersonaForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nombre_completo: "",
    email: "",
    telefono: "",
    direccion: "",
    rol: "cliente", // Default a cliente
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
        const tipo = formData.rol === "cliente" ? "Cliente" : "Inversionista";
        toast.success(`${tipo} creado exitosamente`);
        router.push("/personas");
      } else {
        setError("Error al crear la persona");
      }
    } catch (err) {
      const code = err.response?.data?.code;
      const backendMessage = err.response?.data?.message;

      let message = backendMessage || "Error al crear la persona";

      switch (code) {
        case "IDENTIFICACION_EXISTS":
          message =
            backendMessage ||
            "Ya existe una persona con esta identificación. Por favor, verifique el número o use otro.";
          break;
        case "EMAIL_EXISTS":
          message =
            "Ya existe una persona con este email. Por favor, use otro email o verifique la lista.";
          break;
        case "PROFILE_EXISTS":
          message =
            "Este usuario ya tiene un perfil creado. Será redirigido a la lista.";
          toast.success("La persona ya existe - redirigiendo...");
          setTimeout(() => router.push("/personas"), 2000);
          break;
        case "AUTH_ERROR":
          message =
            "Error de autenticación al crear el usuario. Intente nuevamente.";
          break;
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
        <h1>
          <Users size={28} />
          Nueva Persona
        </h1>
        <p className={styles.subtitle}>Crea un cliente o inversionista</p>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          {/* Selector de Rol */}
          <div className={styles.section}>
            <label className={styles.label}>Tipo de Persona *</label>
            <div className={styles.rolSelector}>
              <label
                className={`${styles.rolOption} ${formData.rol === "cliente" ? styles.selected : ""}`}
              >
                <input
                  type="radio"
                  name="rol"
                  value="cliente"
                  checked={formData.rol === "cliente"}
                  onChange={handleChange}
                />
                <User size={24} />
                <span>Cliente</span>
                <small>Recibe préstamos</small>
              </label>

              <label
                className={`${styles.rolOption} ${formData.rol === "inversionista" ? styles.selected : ""}`}
              >
                <input
                  type="radio"
                  name="rol"
                  value="inversionista"
                  checked={formData.rol === "inversionista"}
                  onChange={handleChange}
                />
                <TrendingUp size={24} />
                <span>Inversionista</span>
                <small>Realiza inversiones</small>
              </label>
            </div>
          </div>

          {/* Documento de Identidad - Campo Prioritario */}
          <div className={`${styles.field} ${styles.fieldHighlight}`}>
            <label className={styles.label}>Documento de Identidad *</label>
            <input
              type="text"
              name="identificacion"
              value={formData.identificacion}
              onChange={handleChange}
              placeholder="Ej: 1234567890"
              className={`${styles.input} ${styles.inputHighlight}`}
              required
              autoFocus
            />
            <p className={styles.helper}>Número de cédula, NIT o pasaporte</p>
          </div>

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
            <Link href="/personas" className={styles.btnSecondary}>
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={styles.btnPrimary}
            >
              {loading
                ? "Creando..."
                : `Crear ${formData.rol === "cliente" ? "Cliente" : "Inversionista"}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
