"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { perfilesApi } from "@/lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import { Users, User, TrendingUp, ArrowLeft, Mail, Phone, MapPin, Fingerprint, Info } from "lucide-react";
import styles from "./PersonaForm.module.css";

export function PersonaForm({ id = null }) {
  const router = useRouter();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nombre_completo: "",
    email: "",
    telefono: "",
    direccion: "",
    rol: "cliente", // Default a cliente
    identificacion: "",
  });

  // Cargar datos si es edición
  useEffect(() => {
    if (isEdit) {
      const fetchPersona = async () => {
        try {
          const response = await perfilesApi.getById(id);
          if (response.data?.success) {
            const persona = response.data.data;
            setFormData({
              nombre_completo: persona.nombre_completo || "",
              email: persona.email || "",
              telefono: persona.telefono || "",
              direccion: persona.direccion || "",
              rol: persona.rol || "cliente",
              identificacion: persona.identificacion || "",
            });
          }
        } catch (error) {
          toast.error("Error al cargar los datos de la persona");
          router.push("/personas");
        } finally {
          setInitialLoading(false);
        }
      };
      fetchPersona();
    }
  }, [id, isEdit, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let response;
      if (isEdit) {
        response = await perfilesApi.update(id, formData);
      } else {
        response = await perfilesApi.create(formData);
      }

      if (response.data?.success) {
        const tipo = formData.rol === "cliente" ? "Cliente" : "Inversionista";
        const accion = isEdit ? "actualizado" : "creado";
        toast.success(`${tipo} ${accion} exitosamente`);
        router.push("/personas");
      } else {
        setError(`Error al ${isEdit ? "actualizar" : "crear"} la persona`);
      }
    } catch (err) {
      const code = err.response?.data?.code;
      const backendMessage = err.response?.data?.message;

      let message =
        backendMessage || `Error al ${isEdit ? "actualizar" : "crear"} la persona`;

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

  if (initialLoading) {
    return <div className={styles.loading}>Cargando datos...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <Link href="/personas" className={styles.btnBack}>
            <ArrowLeft size={20} />
          </Link>
          <h1>
            <Users size={28} />
            {isEdit ? "Editar Persona" : "Nueva Persona"}
          </h1>
        </div>
        <p className={styles.subtitle}>
          {isEdit ? "Actualiza la información de" : "Crea"} un cliente o
          inversionista
        </p>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          {/* Selector de Rol - Estilo Premium */}
          <div className={styles.sectionHeader}>
            <Info size={18} />
            <h2>Tipo de Perfil</h2>
          </div>
          <div className={styles.rolSelector}>
            <label className={`${styles.rolOption} ${formData.rol === "cliente" ? styles.selectedCliente : ""}`}>
              <input type="radio" name="rol" value="cliente" checked={formData.rol === "cliente"} onChange={handleChange} />
              <div className={styles.rolIcon}><User size={32} /></div>
              <div className={styles.rolInfo}>
                <span className={styles.rolName}>Cliente</span>
                <p>Solicita créditos y realiza pagos</p>
              </div>
            </label>

            <label className={`${styles.rolOption} ${formData.rol === "inversionista" ? styles.selectedInversionista : ""}`}>
              <input type="radio" name="rol" value="inversionista" checked={formData.rol === "inversionista"} onChange={handleChange} />
              <div className={styles.rolIcon}><TrendingUp size={32} /></div>
              <div className={styles.rolInfo}>
                <span className={styles.rolName}>Inversionista</span>
                <p>Aporta capital y recibe rendimientos</p>
              </div>
            </label>
          </div>

          <div className={styles.formGrid}>
            {/* Información Personal */}
            <div className={styles.formSection}>
              <div className={styles.sectionTitle}>
                <Fingerprint size={20} />
                <h3>Datos Personales</h3>
              </div>
              
              <div className={styles.field}>
                <label className={styles.label}>Número de Documento *</label>
                <div className={styles.inputWrapper}>
                  <Fingerprint className={styles.inputIcon} size={18} />
                  <input
                    type="text"
                    name="identificacion"
                    value={formData.identificacion}
                    onChange={handleChange}
                    placeholder="Ej: 10102020"
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Nombre Completo *</label>
                <div className={styles.inputWrapper}>
                  <User className={styles.inputIcon} size={18} />
                  <input
                    type="text"
                    name="nombre_completo"
                    value={formData.nombre_completo}
                    onChange={handleChange}
                    placeholder="Ej: Juan Sebastian Pérez"
                    className={styles.input}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className={styles.formSection}>
              <div className={styles.sectionTitle}>
                <Mail size={20} />
                <h3>Contacto y Ubicación</h3>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Correo Electrónico (Opcional)</label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Teléfono de Contacto</label>
                <div className={styles.inputWrapper}>
                  <Phone className={styles.inputIcon} size={18} />
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="Ej: 300 123 4567"
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Dirección de Residencia</label>
                <div className={styles.inputWrapper}>
                  <MapPin className={styles.inputIcon} size={18} />
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Ej: Calle 10 # 5-20"
                    className={styles.input}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.formFooter}>
            <Link href="/personas" className={styles.btnCancel}>
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className={`${styles.btnSubmit} ${formData.rol === 'cliente' ? styles.btnCliente : styles.btnInversionista}`}
            >
              {loading ? "Procesando..." : isEdit ? "Actualizar Perfil" : "Crear Perfil"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
