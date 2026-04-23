"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import { authApi } from "@/lib/api"
import toast from "react-hot-toast"
import styles from "./CambiarPassword.module.css"

export default function CambiarPasswordPage() {
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setLoading(true)

    try {
      await authApi.changePassword(currentPassword, newPassword)
      toast.success("Contraseña actualizada exitosamente")
      router.push("/")
    } catch (err) {
      setError(err.response?.data?.message || "Error al cambiar contraseña")
      toast.error("Error al cambiar contraseña")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <Lock size={48} />
          </div>
          <h1 className={styles.title}>Cambiar Contraseña</h1>
          <p className={styles.subtitle}>Actualiza tu contraseña de seguridad</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Contraseña Actual</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} />
              <input
                type={showCurrent ? "text" : "password"}
                className={styles.input}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Ingresa tu contraseña actual"
                required
              />
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setShowCurrent(!showCurrent)}
              >
                {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Nueva Contraseña</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} />
              <input
                type={showNew ? "text" : "password"}
                className={styles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirmar Contraseña</label>
            <div className={styles.inputWrapper}>
              <CheckCircle className={styles.inputIcon} />
              <input
                type={showConfirm ? "text" : "password"}
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                required
              />
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Actualizando..." : "Cambiar Contraseña"}
          </button>

          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => router.push("/")}
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  )
}
