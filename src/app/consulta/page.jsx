"use client";

import { useState } from "react";
import {
  Search,
  CreditCard,
  Calendar,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";
import styles from "./Consulta.module.css";

export default function ConsultaPage() {
  const [cedula, setCedula] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState(null);
  const [error, setError] = useState("");

  const handleConsulta = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResultados(null);

    try {
      const response = await api.get(`/prestamos/publico/cedula/${cedula}`);
      setResultados(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al consultar préstamos");
      toast.error("Error al consultar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <Search size={48} />
          </div>
          <h1 className={styles.title}>Consulta de Préstamos</h1>
          <p className={styles.subtitle}>
            Consulta tus préstamos ingresando tu cédula
          </p>
        </div>

        <form onSubmit={handleConsulta} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Cédula de Identidad</label>
            <div className={styles.inputWrapper}>
              <CreditCard className={styles.inputIcon} />
              <input
                type="text"
                className={styles.input}
                placeholder="Ingresa tu cédula"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Consultando..." : "Consultar"}
          </button>

          {error && (
            <div className={styles.error}>
              <AlertCircle size={20} />
              {error}
            </div>
          )}
        </form>

        {resultados && (
          <div className={styles.resultados}>
            <div className={styles.perfil}>
              <h3>Información del Cliente</h3>
              <p>
                <strong>Nombre:</strong> {resultados.perfil.nombre}
              </p>
              <p>
                <strong>Teléfono:</strong> {resultados.perfil.telefono}
              </p>
            </div>

            <div className={styles.prestamos}>
              <h3>Préstamos ({resultados.total})</h3>
              {resultados.prestamos.length === 0 ? (
                <p className={styles.noData}>No tienes préstamos activos</p>
              ) : (
                <div className={styles.prestamosList}>
                  {resultados.prestamos.map((prestamo) => (
                    <div key={prestamo.id} className={styles.prestamoCard}>
                      <div className={styles.prestamoHeader}>
                        <Calendar size={16} />
                        <span>
                          {new Date(prestamo.fecha_inicio).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={styles.prestamoBody}>
                        <div className={styles.prestamoField}>
                          <DollarSign size={16} />
                          <span>
                            Monto: ${prestamo.monto_principal.toLocaleString()}
                          </span>
                        </div>
                        <div className={styles.prestamoField}>
                          <span>Estado: {prestamo.estado}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
