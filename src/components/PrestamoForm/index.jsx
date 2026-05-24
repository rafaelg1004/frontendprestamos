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
  const [fondos, setFondos] = useState([{ inversion_id: "", monto: "" }]);
  const [salidas, setSalidas] = useState([{ cuenta_id: "", monto: "" }]);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdPrestamoId, setCreatedPrestamoId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isInvModalOpen, setIsInvModalOpen] = useState(false);
  const [activeFondoIndex, setActiveFondoIndex] = useState(null);
  const [invSearch, setInvSearch] = useState("");
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false);
  const [clienteSearch, setClienteSearch] = useState("");
  const [isCuentaModalOpen, setIsCuentaModalOpen] = useState(false);
  const [activeSalidaIndex, setActiveSalidaIndex] = useState(null);
  const [cuentaSearch, setCuentaSearch] = useState("");
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

  // En modelo de capital abierto ya no hay plazo fijo ni tabla de amortización

  // Cargar clientes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [cliRes, invRes, cueRes] = await Promise.all([
          perfilesApi.getAll({ rol: "cliente", limit: 1000 }),
          inversionesApi.getAll({ estado: "activo", limit: 1000 }),
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

  // Fecha de vencimiento ya no aplica en capital abierto

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
    const formatted = formatInputNumber(value);
    setFormData((prev) => ({ 
      ...prev, 
      monto_principal: formatted
    }));
  };

  const isRepartoCorrecto = () => {
    const totalPrincipal = parseNumber(formData.monto_principal);
    if (totalPrincipal <= 0) return false;

    const totalFondos = fondos.reduce((sum, f) => sum + parseNumber(f.monto || 0), 0);
    const totalSalidas = salidas.reduce((sum, s) => sum + parseNumber(s.monto || 0), 0);

    const fondosOk = Math.abs(totalFondos - totalPrincipal) < 0.01 && fondos.every(f => f.inversion_id && parseNumber(f.monto) > 0);
    const salidasOk = Math.abs(totalSalidas - totalPrincipal) < 0.01 && salidas.every(s => s.cuenta_id && parseNumber(s.monto) > 0);

    return fondosOk && salidasOk;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isRepartoCorrecto()) {
      toast.error("El reparto de capital y la salida de fondos deben coincidir con el monto principal");
      return;
    }
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
        fecha_vencimiento: formData.fecha_vencimiento || null,
        fondos: fondos.map(f => ({ 
          inversion_id: f.inversion_id, 
          monto: parseNumber(f.monto) * 1000
        })),
        salidas: salidas.map(s => ({
          cuenta_id: s.cuenta_id,
          monto: parseNumber(s.monto) * 1000
        })),
        notas: formData.observaciones,
        plazo_meses: parseInt(formData.plazo_meses),
        frecuencia_pago: formData.frecuencia_pago,
        tipo_amortizacion: formData.tipo_amortizacion,
      };

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
        err.response?.data?.error || err.response?.data?.message || err.response?.data?.details || "Error al crear el préstamo";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };


  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleFinish = async () => {
    if (selectedFile && createdPrestamoId) {
      const uploadData = new FormData();
      uploadData.append("archivo", selectedFile);
      uploadData.append("tipo_documento", "otro");

      try {
        setUploading(true);
        await prestamosApi.subirDocumento(createdPrestamoId, uploadData);
        toast.success("Documento vinculado correctamente");
      } catch (error) {
        toast.error("Error al subir el documento");
        return; // Detener redirección si falla la subida importante? O preguntar?
      } finally {
        setUploading(false);
      }
    }
    router.push("/prestamos");
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
                <button
                  type="button"
                  className={styles.selectTrigger}
                  onClick={() => { setClienteSearch(""); setIsClienteModalOpen(true); }}
                  style={{ width: "100%", padding: "0.75rem 1rem", fontSize: "0.95rem" }}
                >
                  {formData.perfil_id ? (
                    <span className={styles.selectTriggerFilled}>
                      <User size={16} />
                      <div className={styles.selectTriggerText}>
                        <span className={styles.selectTriggerName}>
                          {clientes.find(c => c.id === formData.perfil_id)?.nombre_completo}
                        </span>
                      </div>
                    </span>
                  ) : (
                    <span className={styles.selectTriggerPlaceholder}>Buscar y seleccionar cliente...</span>
                  )}
                  <ChevronRight size={16} />
                </button>
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
              </div>
            </div>
          </div>

          {/* Columna Derecha: Origen de Fondos */}
          <div className={styles.sideColumn}>
            {/* Tesorería y Salida (Cuentas) */}
            <div className={`${styles.formCard} ${styles.highlightCard}`}>
              <div className={styles.cardHeader}>
                <CreditCard size={20} />
                <h2>Tesorería y Salida</h2>
              </div>
              <div className={styles.fundList}>
                {salidas.map((s, index) => {
                  const cuentaSeleccionada = cuentas.find(c => c.id === s.cuenta_id);
                  return (
                  <div key={index} className={styles.fundItem}>
                    <button
                      type="button"
                      className={styles.selectTrigger}
                      onClick={() => { setActiveSalidaIndex(index); setCuentaSearch(""); setIsCuentaModalOpen(true); }}
                    >
                      {cuentaSeleccionada ? (
                        <span className={styles.selectTriggerFilled}>
                          <Landmark size={14} />
                          <div className={styles.selectTriggerText}>
                            <span className={styles.selectTriggerName}>{cuentaSeleccionada.nombre}</span>
                            <span className={styles.selectTriggerRate}>({formatCurrency(cuentaSeleccionada.saldo_actual * 1000)})</span>
                          </div>
                        </span>
                      ) : (
                        <span className={styles.selectTriggerPlaceholder}>Cuenta...</span>
                      )}
                      <ChevronRight size={14} />
                    </button>
                    <input
                      type="text"
                      value={s.monto}
                      onChange={(e) => {
                        const newSalidas = [...salidas];
                        newSalidas[index].monto = formatInputNumber(e.target.value);
                        setSalidas(newSalidas);
                      }}
                      placeholder="Monto"
                      className={styles.inputSmall}
                      required
                    />
                    <button type="button" onClick={() => setSalidas(salidas.filter((_, i) => i !== index))} className={styles.btnTrash}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  );
                })}
              </div>
              <button 
                type="button" 
                onClick={() => setSalidas([...salidas, { cuenta_id: '', monto: '' }])}
                className={styles.btnAddSimple}
              >
                <Plus size={16} /> Añadir Cuenta de Salida
              </button>
              <div className={styles.totalBadge}>
                Total Salida: {formatCurrency(salidas.reduce((sum, s) => sum + parseNumber(s.monto || 0), 0) * 1000)}
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
                          <span className={styles.selectTriggerPlaceholder}>Inversión...</span>
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

              <div className={styles.totalBadge}>
                Total Reparto: {formatCurrency(fondos.reduce((sum, f) => sum + parseNumber(f.monto || 0), 0) * 1000)}
              </div>
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
          <div className={styles.submitSection}>
            {!isRepartoCorrecto() && parseNumber(formData.monto_principal) > 0 && (
              <span className={styles.validationText}>
                El reparto y la salida deben coincidir con el capital.
              </span>
            )}
            <button 
              type="submit" 
              disabled={saving || !isRepartoCorrecto()} 
              className={styles.btnSubmit}
            >
              {saving ? "Procesando..." : "Emitir Préstamo"}
            </button>
          </div>
        </div>
      </form>

      {/* Modal Seleccionar Cuenta */}
      <Modal
        isOpen={isCuentaModalOpen}
        onClose={() => setIsCuentaModalOpen(false)}
        title="Seleccionar Cuenta"
        size="md"
      >
        <div className={styles.invModalContent}>
          <div className={styles.invSearchWrapper}>
            <Search size={16} className={styles.invSearchIcon} />
            <input 
              type="text" 
              placeholder="Buscar por nombre..." 
              value={cuentaSearch}
              onChange={(e) => setCuentaSearch(e.target.value)}
              className={styles.invSearchInput}
              autoFocus
            />
          </div>
          <div className={styles.invList}>
            {cuentas.filter(c => c.nombre.toLowerCase().includes(cuentaSearch.toLowerCase())).map(c => (
              <button 
                key={c.id} 
                type="button" 
                className={styles.invItem}
                onClick={() => {
                  const newSalidas = [...salidas];
                  newSalidas[activeSalidaIndex].cuenta_id = c.id;
                  setSalidas(newSalidas);
                  setIsCuentaModalOpen(false);
                }}
              >
                <div className={styles.invItemAvatar} style={{ background: '#e0f2fe', color: '#0284c7' }}>
                  <Landmark size={20} />
                </div>
                <div className={styles.invItemInfo}>
                  <span className={styles.invItemName}>{c.nombre}</span>
                  <div className={styles.invItemMeta}>
                    <span className={styles.invItemAmount}>
                      Saldo: {formatCurrency(c.saldo_actual * 1000)}
                    </span>
                    <span className={styles.invItemDot}>·</span>
                    <span className={styles.invItemRate}>
                      {c.tipo}
                    </span>
                  </div>
                </div>
              </button>
            ))}
            {cuentas.filter(c => c.nombre.toLowerCase().includes(cuentaSearch.toLowerCase())).length === 0 && (
              <div className={styles.invEmpty}>
                <Search size={32} />
                <p>No se encontraron cuentas.</p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal de Éxito y Carga de Documentos */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => router.push("/prestamos")}
        title="¡Préstamo Creado!"
        size="md"
      >
        <div className={styles.successContent}>
          <div className={styles.successHeader}>
            <div className={styles.successIcon}>
              <CheckCircle size={64} />
            </div>
            <h3>¡Emisión Exitosa!</h3>
            <p>El préstamo ha sido registrado correctamente.</p>
          </div>

          <div className={styles.loanSummaryBox}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Cliente:</span>
              <span className={styles.summaryValue}>
                {clientes.find(c => c.id === formData.perfil_id)?.nombre_completo || "N/A"}
              </span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Monto:</span>
              <span className={styles.summaryValue}>$ {formData.monto_principal}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Tasa:</span>
              <span className={styles.summaryValue}>{formData.tasa_interes_mensual}% mensual</span>
            </div>
          </div>
          
          <div className={styles.uploadStep}>
            <div className={styles.uploadHeader}>
              <FileText size={20} />
              <span>Soportes Legales</span>
            </div>
            
            {uploading ? (
              <div className={styles.uploadLoading}>
                <div className={styles.spinner}></div>
                <span>Subiendo documento...</span>
              </div>
            ) : (
              <div className={styles.uploadActions}>
                {selectedFile ? (
                  <div className={styles.selectedFileBox}>
                    <CheckCircle size={16} color="#10b981" />
                    <span className={styles.fileName}>{selectedFile.name}</span>
                    <button onClick={() => setSelectedFile(null)} className={styles.btnRemoveFile}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <p className={styles.uploadHint}>¿Deseas adjuntar la letra o pagaré firmado ahora?</p>
                    <input 
                      type="file" 
                      id="post-create-upload" 
                      style={{ display: 'none' }} 
                      onChange={handleFileSelect}
                    />
                    <label htmlFor="post-create-upload" className={styles.btnUpload}>
                      <Upload size={20} />
                      Seleccionar Archivo
                    </label>
                  </>
                )}
              </div>
            )}
          </div>

          <div className={styles.modalFooter}>
            <button 
              onClick={handleFinish} 
              disabled={uploading}
              className={styles.btnFinish}
            >
              {uploading ? "Subiendo..." : "Terminar y volver"}
            </button>
            <button 
              onClick={() => router.push(`/prestamos/${createdPrestamoId}`)} 
              disabled={uploading}
              className={styles.btnSecondaryLink}
            >
              Ver detalle
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
              .filter(inv => {
                const disp = inv.saldo_disponible !== undefined ? inv.saldo_disponible : parseFloat(inv.monto_invertido);
                return disp > 0 && inv.inversionista.nombre_completo.toLowerCase().includes(invSearch.toLowerCase());
              })
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
                        Disp: {formatCurrency(inv.saldo_disponible !== undefined ? inv.saldo_disponible : parseFloat(inv.monto_invertido))}
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
            {inversiones.filter(inv => {
                const disp = inv.saldo_disponible !== undefined ? inv.saldo_disponible : parseFloat(inv.monto_invertido);
                return disp > 0 && inv.inversionista.nombre_completo.toLowerCase().includes(invSearch.toLowerCase());
            }).length === 0 && (
              <div className={styles.invEmpty}>
                <Search size={32} />
                <p>No se encontraron inversiones</p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal de Selección de Cliente */}
      <Modal
        isOpen={isClienteModalOpen}
        onClose={() => setIsClienteModalOpen(false)}
        title="Buscar Beneficiario"
        size="md"
      >
        <div className={styles.invModalContent}>
          <div className={styles.invSearchWrapper}>
            <Search size={16} className={styles.invSearchIcon} />
            <input
              type="text"
              placeholder="Buscar por nombre o identificación..."
              className={styles.invSearchInput}
              value={clienteSearch}
              onChange={(e) => setClienteSearch(e.target.value)}
              autoFocus
            />
          </div>

          <div className={styles.invList}>
            {clientes
              .filter(cli =>
                cli.nombre_completo?.toLowerCase().includes(clienteSearch.toLowerCase()) ||
                cli.identificacion?.includes(clienteSearch)
              )
              .map((cli) => (
                <button
                  key={cli.id}
                  type="button"
                  className={`${styles.invItem} ${
                    formData.perfil_id === cli.id ? styles.invItemSelected : ''
                  }`}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, perfil_id: cli.id }));
                    setIsClienteModalOpen(false);
                  }}
                >
                  <div className={styles.invItemAvatar}>
                    {cli.nombre_completo?.charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.invItemInfo}>
                    <span className={styles.invItemName}>{cli.nombre_completo}</span>
                    <div className={styles.invItemMeta}>
                      <span className={styles.invItemDate}>
                        C.C: {cli.identificacion}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            }
            {clientes.filter(cli =>
                cli.nombre_completo?.toLowerCase().includes(clienteSearch.toLowerCase()) ||
                cli.identificacion?.includes(clienteSearch)
            ).length === 0 && (
              <div className={styles.invEmpty}>
                <Search size={32} />
                <p>No se encontraron clientes</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
