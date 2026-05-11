"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { prestamosApi, perfilesApi, inversionesApi, cuentasApi } from "@/lib/api";
import { formatCurrency, parseNumber, formatInputNumber } from "@/lib/utils";
import { DollarSign, Calendar, Landmark, CreditCard, PieChart, FileText, Plus, Trash2, ArrowLeft, Info } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import styles from "./PrestamoForm.module.css";

export function PrestamoForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [inversiones, setInversiones] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [fondos, setFondos] = useState([]); // [{ inversion_id, monto }]
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
    cuenta_id: "",
    observaciones: "",
  });

  // Cargar clientes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cliRes, invRes, cueRes] = await Promise.all([
          perfilesApi.getAll({ rol: "cliente" }),
          inversionesApi.getAll({ estado: "activo" }),
          cuentasApi.getAll()
        ]);
        setClientes(cliRes.data?.data || []);
        setInversiones(invRes.data?.data || []);
        setCuentas(cueRes.data?.data || []);
      } catch (err) {
        toast.error("Error al cargar datos necesarios");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
    
    // Validar que la tasa de interés no sea mayor a 100
    if (name === 'tasa_interes_mensual' && parseFloat(value) > 100) {
      setFormData((prev) => ({ ...prev, [name]: '100' }));
      return;
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMontoChange = (e) => {
    const { value } = e.target;
    // Guardamos el valor formateado en el input para mostrar puntos
    // Pero en el estado guardamos el número limpio para cálculos
    const formatted = formatInputNumber(value);
    setFormData((prev) => ({ 
      ...prev, 
      monto_principal: formatted
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      // Convertir montos a milunidades y mapear campos para el backend
      const dataToSend = {
        cliente_id: formData.perfil_id,
        monto_principal: parseNumber(formData.monto_principal) * 1000,
        tasa_interes_mensual: parseFloat(formData.tasa_interes_mensual),
        tasa_mora_diaria: 0.5,
        fecha_inicio: formData.fecha_inicio,
        fecha_vencimiento: formData.fecha_vencimiento,
        cuenta_id: formData.cuenta_id,
        fondos: fondos.map(f => ({ ...f, monto: parseNumber(f.monto) * 1000 })),
        notas: formData.observaciones,
      };

      // Validar que la suma de fondos coincida con el principal
      const totalFondos = fondos.reduce((sum, f) => sum + parseNumber(f.monto || 0), 0);
      if (Math.abs(totalFondos - parseNumber(formData.monto_principal)) > 0.01) {
        throw new Error(`El reparto de fondos (${formatInputNumber(totalFondos)}) debe ser igual al monto del préstamo (${formData.monto_principal})`);
      }

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
        <div className={styles.titleSection}>
          <Link href="/prestamos" className={styles.btnBack}>
            <ArrowLeft size={20} />
          </Link>
          <h1>Nuevo Préstamo</h1>
        </div>
        <p className={styles.subtitle}>Configura las condiciones del crédito y origen de fondos</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.formGrid}>
          {/* Columna Izquierda: Condiciones del Crédito */}
          <div className={styles.mainColumn}>
            {/* Sección: Cliente */}
            <div className={styles.formCard}>
              <div className={styles.cardHeader}>
                <Landmark size={20} />
                <h2>Información del Cliente</h2>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Seleccionar Beneficiario *</label>
                <select
                  name="perfil_id"
                  value={formData.perfil_id}
                  onChange={handleChange}
                  className={styles.select}
                  required
                >
                  <option value="">Seleccione un cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre_completo} ({cliente.identificacion})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sección: Condiciones Financieras */}
            <div className={styles.formCard}>
              <div className={styles.cardHeader}>
                <DollarSign size={20} />
                <h2>Condiciones Financieras</h2>
              </div>
              <div className={styles.inputGroup}>
                <div className={styles.field}>
                  <label className={styles.label}>Capital Principal ($) *</label>
                  <div className={styles.inputWrapper}>
                    <DollarSign className={styles.inputIcon} size={18} />
                    <input
                      type="text"
                      name="monto_principal"
                      value={formData.monto_principal}
                      onChange={handleMontoChange}
                      placeholder="5.000.000"
                      className={styles.input}
                      required
                    />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Interés Mensual (%) *</label>
                  <input
                    type="number"
                    name="tasa_interes_mensual"
                    value={formData.tasa_interes_mensual}
                    onChange={handleChange}
                    className={styles.input}
                    step="0.1"
                    required
                  />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <div className={styles.field}>
                  <label className={styles.label}>Plazo (Meses) *</label>
                  <input
                    type="number"
                    name="plazo_meses"
                    value={formData.plazo_meses}
                    onChange={handleChange}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Frecuencia de Cobro</label>
                  <select name="frecuencia_pago" value={formData.frecuencia_pago} onChange={handleChange} className={styles.select}>
                    <option value="mensual">Mensual</option>
                    <option value="quincenal">Quincenal</option>
                    <option value="semanal">Semanal</option>
                    <option value="diario">Diario</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sección: Fechas */}
            <div className={styles.formCard}>
              <div className={styles.cardHeader}>
                <Calendar size={20} />
                <h2>Calendario</h2>
              </div>
              <div className={styles.inputGroup}>
                <div className={styles.field}>
                  <label className={styles.label}>Fecha Desembolso *</label>
                  <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} className={styles.input} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Fecha Vencimiento</label>
                  <input type="date" value={formData.fecha_vencimiento} className={styles.inputReadOnly} readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Origen de Fondos */}
          <div className={styles.sideColumn}>
            {/* Tesorería */}
            <div className={`${styles.formCard} ${styles.highlightCard}`}>
              <div className={styles.cardHeader}>
                <CreditCard size={20} />
                <h2>Tesorería y Salida</h2>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Cuenta de Origen *</label>
                <select name="cuenta_id" value={formData.cuenta_id} onChange={handleChange} className={styles.select} required>
                  <option value="">¿De dónde sale el dinero?</option>
                  {cuentas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({formatCurrency(c.saldo_actual)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reparto de Inversionistas */}
            <div className={styles.formCard}>
              <div className={styles.cardHeader}>
                <PieChart size={20} />
                <h2>Reparto de Capital</h2>
              </div>
              
              <div className={styles.fundList}>
                {fondos.map((f, index) => (
                  <div key={index} className={styles.fundItem}>
                    <select
                      value={f.inversion_id}
                      onChange={(e) => {
                        const newFondos = [...fondos];
                        newFondos[index].inversion_id = e.target.value;
                        setFondos(newFondos);
                      }}
                      className={styles.selectSmall}
                      required
                    >
                      <option value="">Inversión...</option>
                      {inversiones.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.inversionista.nombre_completo}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={f.monto}
                      onChange={(e) => {
                        const newFondos = [...fondos];
                        newFondos[index].monto = formatInputNumber(e.target.value);
                        setFondos(newFondos);
                      }}
                      placeholder="Monto"
                      className={styles.inputSmall}
                      required
                    />
                    <button type="button" onClick={() => setFondos(fondos.filter((_, i) => i !== index))} className={styles.btnTrash}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <button 
                type="button" 
                onClick={() => setFondos([...fondos, { inversion_id: '', monto: '' }])}
                className={styles.btnAddSimple}
              >
                <Plus size={16} /> Añadir Inversionista
              </button>

              {fondos.length > 0 && (
                <div className={styles.totalBadge}>
                  Total: {formatCurrency(fondos.reduce((sum, f) => sum + parseNumber(f.monto || 0), 0) * 1000)}
                </div>
              )}
            </div>

            {/* Notas */}
            <div className={styles.formCard}>
              <div className={styles.cardHeader}>
                <FileText size={20} />
                <h2>Observaciones</h2>
              </div>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                placeholder="Detalles internos..."
                className={styles.textarea}
              />
            </div>
          </div>
        </div>

        <div className={styles.formFooter}>
          <Link href="/prestamos" className={styles.btnCancel}>Cancelar</Link>
          <button type="submit" disabled={saving || loading} className={styles.btnSubmit}>
            {saving ? "Procesando..." : "Emitir Préstamo"}
          </button>
        </div>
      </form>
    </div>
  );
}
