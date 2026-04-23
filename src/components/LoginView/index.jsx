"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Shield, AlertCircle } from "lucide-react";
import { authApi } from "@/lib/api";
import toast from "react-hot-toast";
import styles from "./LoginView.module.css";

export function LoginView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (searchParams.get("expired") === "true") {
      setSessionExpired(true);
      toast.error(
        "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
      );
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authApi.login(email, password);
      const token = response.data?.data?.token;

      if (token) {
        authApi.setToken(token);
        toast.success("Bienvenido");
        router.push("/");
      } else {
        setError("Error en la respuesta del servidor");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error al iniciar sesión");
      toast.error("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Shield size={32} />
          </div>
          <h1 className={styles.title}>Panel Administrativo</h1>
          <p className={styles.subtitle}>Inicia sesión como administrador</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {sessionExpired && (
            <div className={styles.expiredAlert}>
              <AlertCircle size={20} />
              <span>
                Tu sesión ha expirado. Por favor, inicia sesión nuevamente.
              </span>
            </div>
          )}
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.icon} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@prestamos.com"
                className={styles.input}
                required
              />
            </div>
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
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            ¿No tienes acceso?{" "}
            <Link href="/register" className={styles.link}>
              Crea tu usuario aquí
            </Link>
          </p>
          <p className={styles.footerText} style={{ marginTop: "0.5rem" }}>
            © 2024 Sistema de Préstamos e Inversiones
          </p>
        </div>
      </div>
    </div>
  );
}
