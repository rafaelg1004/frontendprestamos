"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { prestamosApi, perfilesApi, inversionesApi, cuentasApi } from "@/lib/api";
import { formatCurrency, parseNumber, formatInputNumber } from "@/lib/utils";
import { DollarSign, Calendar, Landmark, CreditCard, PieChart, FileText, Plus, Trash2, ArrowLeft, CheckCircle, Upload, Search, User, ChevronRight, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Modal } from "../Modal";
import { prestamosApi as api } from "@/lib/api"; // Alias para evitar colisiones si fuera necesario
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdPrestamoId, setCreatedPrestamoId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isInvModalOpen, setIsInvModalOpen] = useState(false);
  const [activeFondoIndex, setActiveFondoIndex] = useState(null);
  const [invSearch, setInvSearch] = useState("");
  const [formData, setFormData] = useState({
    perfil_id: "",
    monto_principal: "",
    tasa_interes_mensual: "20",
    plazo_meses: "1",
    fecha_inicio: new Date().toISOString().split("T")[0],
    fecha_vencimiento: "",
    frecuencia_pago: "mensual",
    tipo_amortizacion: "frances",
    metodo_pago: "efectivo",
    cuenta_id: "",
    observaciones: "",
  });
  const [previewTable, setPreviewTable] = useState([]);

  // Ajustar plazo automáticamente según la frecuencia para que sea 1 mes por defecto
  useEffect(() => {
    const autoPlazo = {
      diario: "30",
      semanal: "4",
      quincenal: "2",
      mensual: "1"
    };
    if (autoPlazo[formData.frecuencia_pago]) {
      setFormData(prev => ({
        ...prev,
        plazo_meses: autoPlazo[formData.frecuencia_pago]
      }));
    }
  }, [formData.frecuencia_pago]);

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
        plazo_meses: parseInt(formData.plazo_meses),
        frecuencia_pago: formData.frecuencia_pago,
        tipo_amortizacion: formData.tipo_amortizacion,
      };

      // Validar que la suma de fondos coincida con el principal
      const totalFondos = fondos.reduce((sum, f) => sum + parseNumber(f.monto || 0), 0);
      if (Math.abs(totalFondos - parseNumber(formData.monto_principal)) > 0.01) {
        throw new Error(`El reparto de fondos (${formatInputNumber(totalFondos)}) debe ser igual al monto del préstamo (${formData.monto_principal})`);
      }

      const response = await prestamosApi.create(dataToSend);

      if (response.data?.success) {
        const newId = response.data.data.id;
        setCreatedPrestamoId(newId);
        toast.success("Préstamo creado exitosamente");
        setShowSuccessModal(true);
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

  const handlePreviewTable = () => {
    const p = parseNumber(formData.monto_principal);
    const tasaMensual = parseFloat(formData.tasa_interes_mensual) / 100;
    const n = parseInt(formData.plazo_meses);
    
    if (!p || !n) {
      toast.error("Ingresa monto y duración para previsualizar");
      return;
    }

    // Multiplicador solo para la TASA
    let multiplier = 1;
    if (formData.frecuencia_pago === "diario") multiplier = 30;
    else if (formData.frecuencia_pago === "semanal") multiplier = 4;
    else if (formData.frecuencia_pago === "quincenal") multiplier = 2;

    const r = tasaMensual / multiplier;

    let table = [];
    if (formData.tipo_amortizacion === "frances") {
      const cuotaMonto = Math.round((p * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1) / 1000) * 1000;
      let saldo = p;
      for (let i = 1; i <= n; i++) {
        const interes = Math.round((saldo * r) / 1000) * 1000;
        let capital = cuotaMonto - interes;
        if (i === n) capital = saldo;
        saldo -= capital;
        table.push({ numero: i, capital, interes, total: capital + interes, saldo: Math.max(0, saldo) });
      }
    } else if (formData.tipo_amortizacion === "flat") {
      const totalInteresPlan = Math.round((p * tasaMensual * (n / multiplier)) / 1000) * 1000;
      const interesCuotaBase = Math.round((totalInteresPlan / n) / 1000) * 1000;
      const capitalCuotaBase = Math.round((p / n) / 1000) * 1000;
      
      let saldoCapital = p;
      let saldoInteres = totalInteresPlan;

      for (let i = 1; i <= n; i++) {
        let currentCapital = capitalCuotaBase;
        let currentInteres = interesCuotaBase;

        if (i === n) {
          currentCapital = saldoCapital;
          currentInteres = saldoInteres;
        } else {
          currentCapital = Math.min(currentCapital, saldoCapital);
          currentInteres = Math.min(currentInteres, saldoInteres);
        }

        saldoCapital -= currentCapital;
        saldoInteres -= currentInteres;
        table.push({ numero: i, capital: currentCapital, interes: currentInteres, total: currentCapital + currentInteres, saldo: Math.max(0, saldoCapital) });
      }
    } else {
      // Al vencimiento
      const interesTotal = Math.round((p * tasaMensual * (n / multiplier)) / 1000) * 1000;
      table = [{ numero: 1, capital: p, interes: interesTotal, total: p + interesTotal, saldo: 0 }];
    }
    setPreviewTable(table);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("archivo", file);
    formData.append("tipo_documento", "otro");

    try {
      setUploading(true);
      await prestamosApi.subirDocumento(createdPrestamoId, formData);
      toast.success("Documento vinculado correctamente");
    } catch (error) {
      toast.error("Error al subir el documento");
    } finally {
      setUploading(false);
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
                  <label className={styles.label}>
                    {formData.frecuencia_pago === "diario" ? "Duración (Días)" : 
                     formData.frecuencia_pago === "semanal" ? "Duración (Semanas)" :
                     formData.frecuencia_pago === "quincenal" ? "Duración (Quincenas)" :
                     "Duración (Meses)"} *
                  </label>
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
              <div className={styles.field}>
                <label className={styles.label}>Sistema de Amortización</label>
                <select 
                  name="tipo_amortizacion" 
                  value={formData.tipo_amortizacion} 
                  onChange={handleChange} 
                  className={styles.select}
                >
                  <option value="frances">Francés (Cuota Fija)</option>
                  <option value="flat">Flat (Interés Fijo)</option>
                  <option value="final">Al Vencimiento (Un solo pago)</option>
                </select>
              </div>

              <button type="button" onClick={handlePreviewTable} className={styles.btnPreview}>
                <TrendingUp size={16} /> Previsualizar Tabla de Cuotas
              </button>

              {previewTable.length > 0 && (
                <div className={styles.previewSection}>
                  <h3 className={styles.previewTitle}>Desglose de Cuotas Proyectado</h3>
                  <div className={styles.previewTableContainer}>
                    <table className={styles.previewTable}>
                      <thead>
                        <tr>
                          <th>N°</th>
                          <th>Capital</th>
                          <th>Interés</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewTable.map(c => (
                          <tr key={c.numero}>
                            <td>{c.numero}</td>
                            <td>{formatCurrency(c.capital * 1000)}</td>
                            <td>{formatCurrency(c.interes * 1000)}</td>
                            <td style={{ fontWeight: 700 }}>{formatCurrency(c.total * 1000)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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
                {fondos.map((f, index) => {
                  const invSeleccionada = inversiones.find(inv => inv.id === f.inversion_id);
                  return (
                    <div key={index} className={styles.fundItem}>
                      <button
                        type="button"
                        className={styles.selectTrigger}
                        onClick={() => { setActiveFondoIndex(index); setInvSearch(""); setIsInvModalOpen(true); }}
                      >
                        {invSeleccionada ? (
                          <span className={styles.selectTriggerFilled}>
                            <User size={14} />
                            <div className={styles.selectTriggerText}>
                              <span className={styles.selectTriggerName}>{invSeleccionada.inversionista.nombre_completo}</span>
                              <span className={styles.selectTriggerRate}>({invSeleccionada.tasa_interes_pactada}%)</span>
                            </div>
                          </span>
                        ) : (
                          <span className={styles.selectTriggerPlaceholder}>Seleccionar inversión...</span>
                        )}
                        <ChevronRight size={14} />
                      </button>
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
                  );
                })}
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

      {/* Modal de Éxito y Carga de Documentos */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => router.push("/prestamos")}
        title="¡Préstamo Creado!"
        size="md"
      >
        <div className={styles.successContent}>
          <div className={styles.successIcon}>
            <CheckCircle size={64} />
          </div>
          <h3>¡Emisión Exitosa!</h3>
          <p>El préstamo ha sido registrado correctamente en el sistema.</p>
          
          <div className={styles.uploadStep}>
            <div className={styles.uploadHeader}>
              <FileText size={20} />
              <span>Soportes Legales (Opcional)</span>
            </div>
            <p className={styles.uploadHint}>Sube la letra, pagaré o contrato ahora para dejar el registro completo.</p>
            
            <div className={styles.uploadActions}>
              <input 
                type="file" 
                id="post-create-upload" 
                style={{ display: 'none' }} 
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <label htmlFor="post-create-upload" className={styles.btnUpload}>
                <Upload size={20} />
                {uploading ? "Subiendo..." : "Subir Documento"}
              </label>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button 
              onClick={() => router.push("/prestamos")} 
              className={styles.btnFinish}
            >
              Terminar y volver a la lista
            </button>
            <button 
              onClick={() => router.push(`/prestamos/${createdPrestamoId}`)} 
              className={styles.btnSecondaryLink}
            >
              Ver detalle completo
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Selección de Inversiones */}
      <Modal
        isOpen={isInvModalOpen}
        onClose={() => setIsInvModalOpen(false)}
        title="Seleccionar Inversión"
        size="md"
      >
        <div className={styles.invModalContent}>
          <div className={styles.invSearchWrapper}>
            <Search size={16} className={styles.invSearchIcon} />
            <input
              type="text"
              placeholder="Buscar por nombre del inversor..."
              className={styles.invSearchInput}
              value={invSearch}
              onChange={(e) => setInvSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className={styles.invList}>
            {inversiones
              .filter(inv =>
                inv.inversionista.nombre_completo
                  .toLowerCase()
                  .includes(invSearch.toLowerCase())
              )
              .map((inv) => (
                <button
                  key={inv.id}
                  type="button"
                  className={`${styles.invItem} ${
                    fondos[activeFondoIndex]?.inversion_id === inv.id ? styles.invItemSelected : ''
                  }`}
                  onClick={() => {
                    if (activeFondoIndex !== null) {
                      const newFondos = [...fondos];
                      newFondos[activeFondoIndex].inversion_id = inv.id;
                      setFondos(newFondos);
                    }
                    setIsInvModalOpen(false);
                  }}
                >
                  <div className={styles.invItemAvatar}>
                    {inv.inversionista.nombre_completo.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.invItemInfo}>
                    <span className={styles.invItemName}>{inv.inversionista.nombre_completo}</span>
                    <div className={styles.invItemMeta}>
                      <span className={styles.invItemAmount}>
                        {formatCurrency(parseFloat(inv.monto_invertido))}
                      </span>
                      <span className={styles.invItemDot}>·</span>
                      <span className={styles.invItemRate}>
                        {inv.tasa_interes_pactada}% mensual
                      </span>
                      <span className={styles.invItemDot}>·</span>
                      <span className={styles.invItemDate}>
                        {new Date(inv.fecha_inversion).toLocaleDateString('es-CO', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  <div className={styles.invItemBadge}>{inv.estado}</div>
                </button>
              ))
            }
            {inversiones.filter(inv =>
              inv.inversionista.nombre_completo.toLowerCase().includes(invSearch.toLowerCase())
            ).length === 0 && (
              <div className={styles.invEmpty}>
                <Search size={32} />
                <p>No se encontraron inversiones</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
