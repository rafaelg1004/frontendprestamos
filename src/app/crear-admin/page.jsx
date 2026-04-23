"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UserPlus, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react"
import { authApi } from "@/lib/api"
import toast from "react-hot-toast"
import styles from "./CrearAdmin.module.css"

export default function CrearAdminPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setLoading(true)

    try {
      await authApi.createAdmin(email, password, nombre)
      toast.success("Usuario administrativo creado exitosamente")
      router.push("/")
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear usuario")
      toast.error("Error al crear usuario")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <UserPlus size={48} />
          </div>
          <h1 className={styles.title}>Crear Administrador</h1>
          <p className={styles.subtitle}>Agrega un nuevo usuario administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Nombre</label>
            <div className={styles.inputWrapper}>
              <UserPlus className={styles.inputIcon} />
              <input
                type="text"
                className={styles.input}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre completo"
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} />
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ejemplo.com"
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Contraseña</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Creando..." : "Crear Administrador"}
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
