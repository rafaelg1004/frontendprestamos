"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CreditCard, Lock, UserPlus, AlertCircle } from "lucide-react";
import { authApi } from "@/lib/api";
import toast from "react-hot-toast";
import styles from "./RegisterView.module.css";

export function RegisterView() {
  const router = useRouter();
  const [identificacion, setIdentificacion] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.register(identificacion, password);

      // Registro exitoso - redirigir al login (no iniciar sesión automáticamente)
      toast.success("Usuario creado exitosamente. Ahora inicia sesión.");
      router.push("/login");
    } catch (err) {
      const message = err.response?.data?.error || "Error al registrar usuario";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <UserPlus size={32} />
          </div>
          <h1 className={styles.title}>Crear Usuario</h1>
          <p className={styles.subtitle}>
            Ingresa tu identificación para activar tu acceso al sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Identificación (Cédula)</label>
            <div className={styles.inputWrapper}>
              <CreditCard className={styles.icon} />
              <input
                type="text"
                value={identificacion}
                onChange={(e) => setIdentificacion(e.target.value)}
                placeholder="1234567890"
                className={styles.input}
                required
              />
            </div>
            <p className={styles.hint}>
              Debes estar registrado previamente en el módulo de personas
            </p>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Contraseña</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.icon} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={styles.input}
                required
                minLength={6}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirmar Contraseña</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.icon} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={styles.input}
                required
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? "Registrando..." : "Crear Usuario"}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className={styles.link}>
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
