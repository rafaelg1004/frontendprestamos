"use client";

import { useState, useEffect, useRef } from "react";
import { inversionesApi, perfilesApi, cuentasApi } from "@/lib/api";
import { formatCurrency, parseNumber, formatInputNumber } from "@/lib/utils";
import toast from "react-hot-toast";
import { X, TrendingUp, DollarSign, Wallet, Calendar, FileText, Activity, Search, User } from "lucide-react";
import styles from "./InversionForm.module.css";

export function InversionForm({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [inversionistas, setInversionistas] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  
  // States para Buscador Inversionista
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // States para Buscador Cuentas
  const [accountSearch, setAccountSearch] = useState("");
  const [showAccDropdown, setShowAccDropdown] = useState(false);
  const accDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    perfil_id: "",
    monto: "",
    tasa_interes_mensual: "2",
    fecha_inicio: new Date().toISOString().split("T")[0],
    cuenta_id: "",
    observaciones: "",
  });

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const [invRes, cuentasRes] = await Promise.all([
            perfilesApi.getAll({ rol: "inversionista", limit: 1000 }),
            cuentasApi.getAll()
          ]);
          setInversionistas(invRes.data?.data || []);
          setCuentas(cuentasRes.data?.data || []);
        } catch (err) {
          toast.error("Error al cargar datos");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setShowDropdown(false);
      if (accDropdownRef.current && !accDropdownRef.current.contains(event.target)) setShowAccDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const filteredInversionistas = inversionistas.filter(inv => 
    (inv.nombre_completo?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (inv.email?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const filteredCuentas = cuentas.filter(c => 
    (c.nombre?.toLowerCase() || "").includes(accountSearch.toLowerCase())
  );

  const handleSelectInversionista = (inv) => {
    setFormData(prev => ({ ...prev, perfil_id: inv.id }));
    setSearchTerm(inv.nombre_completo);
    setShowDropdown(false);
  };

  const handleSelectCuenta = (c) => {
    setFormData(prev => ({ ...prev, cuenta_id: c.id }));
    setAccountSearch(c.nombre);
    setShowAccDropdown(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'tasa_interes_mensual' && parseFloat(value) > 100) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMontoChange = (e) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, monto: formatInputNumber(value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.perfil_id) return toast.error("Seleccione un inversionista");
    if (!formData.cuenta_id) return toast.error("Seleccione una cuenta de destino");
    
    setSaving(true);
    try {
      const dataToSend = {
        inversionista_id: formData.perfil_id,
        monto_invertido: parseNumber(formData.monto) * 1000,
        tasa_interes_pactada: parseFloat(formData.tasa_interes_mensual),
        cuenta_id: formData.cuenta_id,
        notas: formData.observaciones,
      };

      await inversionesApi.create(dataToSend);
      toast.success("Inversión creada exitosamente");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al crear la inversión");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>Nueva Inversión</h2>
            <p className={styles.subtitle}>Ingreso de capital de inversionista</p>
          </div>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.grid}>
            
            {/* Buscador de Inversionista */}
            <div className={styles.fieldFull} ref={dropdownRef}>
              <label><User size={14} /> Inversionista *</label>
              <div className={styles.searchContainer}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Buscar inversionista..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  autoComplete="off"
                  required
                />
                {showDropdown && (
                  <div className={styles.dropdown}>
                    {filteredInversionistas.length > 0 ? (
                      filteredInversionistas.map(inv => (
                        <div key={inv.id} className={styles.dropdownItem} onClick={() => handleSelectInversionista(inv)}>
                          <div className={styles.invName}>{inv.nombre_completo}</div>
                          <div className={styles.invEmail}>{inv.email}</div>
                        </div>
                      ))
                    ) : <div className={styles.dropdownItem}>No se encontraron resultados</div>}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.field}>
              <label><DollarSign size={14} /> Monto ($) *</label>
              <input type="text" name="monto" value={formData.monto} onChange={handleMontoChange} placeholder="0.000" required />
            </div>
            <div className={styles.field}>
              <label><Activity size={14} /> Tasa Mensual (%) *</label>
              <input type="number" name="tasa_interes_mensual" value={formData.tasa_interes_mensual} onChange={handleChange} step="0.1" required />
            </div>

            {/* Buscador de Cuentas */}
            <div className={styles.field} ref={accDropdownRef}>
              <label><Wallet size={14} /> Cuenta de Destino *</label>
              <div className={styles.searchContainer}>
                <Search size={16} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Buscar cuenta..."
                  value={accountSearch}
                  onChange={(e) => { setAccountSearch(e.target.value); setShowAccDropdown(true); }}
                  onFocus={() => setShowAccDropdown(true)}
                  autoComplete="off"
                  required
                />
                {showAccDropdown && (
                  <div className={styles.dropdown}>
                    {filteredCuentas.length > 0 ? (
                      filteredCuentas.map(c => (
                        <div key={c.id} className={styles.dropdownItem} onClick={() => handleSelectCuenta(c)}>
                          <div className={styles.invName}>{c.nombre}</div>
                          <div className={styles.invEmail}>Saldo: {formatCurrency(c.saldo_actual)}</div>
                        </div>
                      ))
                    ) : <div className={styles.dropdownItem}>No hay cuentas</div>}
                  </div>
                )}
              </div>
            </div>

            <div className={styles.field}>
              <label><Calendar size={14} /> Fecha de Registro *</label>
              <input type="date" name="fecha_inicio" value={formData.fecha_inicio} onChange={handleChange} required />
            </div>

            <div className={styles.fieldFull}>
              <label><FileText size={14} /> Notas / Observaciones</label>
              <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows={2} placeholder="Opcional..." />
            </div>

          </div>

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.btnCancel}>Cancelar</button>
            <button type="submit" disabled={saving} className={styles.btnSubmit}>{saving ? "Procesando..." : "Crear Inversión"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
