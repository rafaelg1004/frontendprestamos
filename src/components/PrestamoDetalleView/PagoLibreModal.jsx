"use client";

import { Modal } from "../Modal";
import { formatCurrency, formatInputNumber, parseNumber } from "@/lib/utils";
import styles from "./PrestamoDetalleView.module.css";
import { useEffect } from "react";

export function PagoLibreModal({
  isOpen,
  onClose,
  prestamo,
  pagoLibreData,
  setPagoLibreData,
  distribucionCapital,
  setDistribucionCapital,
  distribucionIntereses,
  setDistribucionIntereses,
  cuentas,
  uploading,
  onSubmit,
  archivoPagoLibre,
  setArchivoPagoLibre
}) {
  const calculos = prestamo?.calculos;
  const isOverCapital = (parseFloat(pagoLibreData.monto_capital) || 0) * 1000 > (calculos?.capital_pendiente || 0);
  const isFormInvalid = (!pagoLibreData.condonar_intereses && !pagoLibreData.monto_capital && !pagoLibreData.monto_interes) || isOverCapital || !pagoLibreData.notas?.trim();

  // Actualizar distribuciones automáticamente al cambiar el monto de capital/interés
  useEffect(() => {
    if (!prestamo?.fondos) return;

    const capital = parseFloat(pagoLibreData.monto_capital) || 0;
    if (capital > 0) {
      const dist = prestamo.fondos.map(f => {
        const proporcion = parseFloat(f.monto_aportado) / prestamo.monto_principal;
        const montoCapital = Math.round(capital * proporcion);
        return {
          inversion_id: f.inversion_id,
          nombre_completo: f.inversionista?.nombre_completo,
          monto: montoCapital.toString()
        };
      });
      setDistribucionCapital(dist);
    } else {
      setDistribucionCapital([]);
    }
  }, [pagoLibreData.monto_capital, prestamo]);

  useEffect(() => {
    if (!prestamo?.fondos) return;

    const interes = parseFloat(pagoLibreData.monto_interes) || 0;
    if (interes > 0) {
      const dist = prestamo.fondos.map(f => {
        const proporcion = parseFloat(f.monto_aportado) / prestamo.monto_principal;
        const proporcionInteres = (parseFloat(f.tasa_interes_pactada) || 0) / parseFloat(prestamo.tasa_interes_mensual);
        const interesExacto = interes * proporcion * proporcionInteres;
        // Redondear hacia abajo a los 100 pesos más cercanos para favorecer al admin
        const montoInteres = Math.floor(interesExacto / 100) * 100;
        return {
          inversion_id: f.inversion_id,
          nombre_completo: f.inversionista?.nombre_completo,
          monto: montoInteres.toString()
        };
      });
      setDistribucionIntereses(dist);
    } else {
      setDistribucionIntereses([]);
    }
  }, [pagoLibreData.monto_interes, prestamo]);

  if (!prestamo || !calculos) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Pago a Capital e Intereses"
      size="md"
    >
      <form onSubmit={onSubmit}>
        {/* Resumen de deuda - tarjetas con color */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)', 
            borderRadius: '10px', 
            padding: '0.85rem 1rem',
            border: '1px solid #f59e0b33'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.3rem' }}>
              Deuda de Interés
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#78350f' }}>
              {formatCurrency(calculos.interes_total_deuda)}
            </div>
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', 
            borderRadius: '10px', 
            padding: '0.85rem 1rem',
            border: '1px solid #3b82f633'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '0.3rem' }}>
              Capital Pendiente
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1e3a8a' }}>
              {formatCurrency(calculos.capital_pendiente)}
            </div>
          </div>
        </div>

        {/* Campos de abono lado a lado */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <div className={styles.formGroup} style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', display: 'block' }}>Abono a Capital</label>
            <div className={styles.distribucionInputWrapper}>
              <span className={styles.distribucionCurrency}>$</span>
              <input
                type="text"
                value={formatInputNumber(pagoLibreData.monto_capital)}
                className={`${styles.distribucionInput} ${isOverCapital ? styles.inputError : ''}`}
                onChange={(e) => setPagoLibreData({ ...pagoLibreData, monto_capital: parseNumber(e.target.value) })}
                placeholder="0"
                style={isOverCapital ? { borderColor: '#ef4444', backgroundColor: '#fef2f2', color: '#b91c1c' } : {}}
              />
            </div>
            {isOverCapital && (
              <div style={{ color: '#dc2626', fontSize: '0.75rem', marginTop: '4px', fontWeight: 500 }}>
                Supera el capital pendiente
              </div>
            )}
          </div>
          
          <div className={styles.formGroup} style={{ marginBottom: 0 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', display: 'block' }}>Abono a Intereses</label>
            <div className={styles.distribucionInputWrapper}>
              <span className={styles.distribucionCurrency}>$</span>
              <input
                type="text"
                value={formatInputNumber(pagoLibreData.monto_interes)}
                className={styles.distribucionInput}
                onChange={(e) => setPagoLibreData({ ...pagoLibreData, monto_interes: parseNumber(e.target.value) })}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Condonar intereses - más compacto */}
        <div 
          style={{ 
            marginBottom: '1rem',
            padding: '0.7rem 0.85rem', 
            borderRadius: '8px', 
            border: pagoLibreData.condonar_intereses ? '1px solid #3b82f6' : '1px solid #e2e8f0', 
            backgroundColor: pagoLibreData.condonar_intereses ? '#eff6ff' : '#f8fafc',
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.65rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease-in-out'
          }}
          onClick={() => setPagoLibreData({ ...pagoLibreData, condonar_intereses: !pagoLibreData.condonar_intereses })}
        >
          <input 
            type="checkbox" 
            id="condonar"
            checked={pagoLibreData.condonar_intereses}
            onChange={(e) => setPagoLibreData({ ...pagoLibreData, condonar_intereses: e.target.checked })}
            style={{ width: '1rem', height: '1rem', cursor: 'pointer', accentColor: '#3b82f6', flexShrink: 0 }}
            onClick={(e) => e.stopPropagation()}
          />
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: pagoLibreData.condonar_intereses ? '#1e3a8a' : '#0f172a' }}>
              Condonar intereses restantes
            </span>
            <span style={{ fontSize: '0.72rem', color: pagoLibreData.condonar_intereses ? '#1e40af' : '#64748b', marginLeft: '0.4rem' }}>
              — La deuda de interés bajará a $0
            </span>
          </div>
        </div>

        {/* Cuenta destino */}
        <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', display: 'block' }}>Cuenta Destino Capital *</label>
          <select
            value={pagoLibreData.cuenta_id}
            onChange={(e) => setPagoLibreData({ ...pagoLibreData, cuenta_id: e.target.value })}
            required={parseFloat(pagoLibreData.monto_capital) > 0}
          >
            <option value="">Selecciona cuenta para capital...</option>
            {cuentas.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre} (Saldo: {formatCurrency(c.saldo_actual)})</option>
            ))}
          </select>
        </div>

        {distribucionCapital.length > 0 && (
          <div className={styles.distribucionContainer}>
            <label className={styles.distribucionTitle}>Distribución de Abono a Capital</label>
            {distribucionCapital.map((dist, index) => (
              <div key={dist.inversion_id} className={styles.distribucionRow}>
                <span className={styles.distribucionName}>{dist.nombre_completo}</span>
                <div className={styles.distribucionInputWrapper}>
                  <span className={styles.distribucionCurrency}>$</span>
                  <input
                    type="text"
                    value={formatInputNumber(dist.monto)}
                    className={styles.distribucionInput}
                    onChange={(e) => {
                      const newDist = [...distribucionCapital];
                      newDist[index].monto = parseNumber(e.target.value);
                      setDistribucionCapital(newDist);
                    }}
                  />
                </div>
              </div>
            ))}
            {(() => {
              const suma = distribucionCapital.reduce((sum, d) => sum + parseFloat(d.monto || 0), 0);
              const capitalAbono = parseFloat(pagoLibreData.monto_capital) || 0;
              const diff = Math.abs(suma - capitalAbono);
              if (diff > 1) {
                return <div className={styles.distribucionError}>La suma de la distribución no coincide con el abono a capital.</div>;
              }
              return null;
            })()}
          </div>
        )}

        {distribucionIntereses.length > 0 && (
          <div className={styles.distribucionContainer}>
            <label className={styles.distribucionTitle}>Distribución de Abono a Intereses</label>
            <div className={styles.distribucionHelpText}>
              <span>El sistema calculó el interés por inversionista según su tasa pactada. Lo que sobre (el margen de ganancia) irá a la Billetera del Administrador.</span>
            </div>
            {distribucionIntereses.map((dist, index) => (
              <div key={dist.inversion_id} className={styles.distribucionRow}>
                <span className={styles.distribucionName}>{dist.nombre_completo}</span>
                <div className={styles.distribucionInputWrapper}>
                  <span className={styles.distribucionCurrency}>$</span>
                  <input
                    type="text"
                    value={formatInputNumber(dist.monto)}
                    className={styles.distribucionInput}
                    onChange={(e) => {
                      const newDist = [...distribucionIntereses];
                      newDist[index].monto = parseNumber(e.target.value);
                      setDistribucionIntereses(newDist);
                    }}
                  />
                </div>
              </div>
            ))}
            {(() => {
              const sumaInversionistas = distribucionIntereses.reduce((sum, d) => sum + parseFloat(d.monto || 0), 0);
              const abonoInteres = parseFloat(pagoLibreData.monto_interes) || 0;
              const gananciaAdmin = abonoInteres - sumaInversionistas;
              
              if (sumaInversionistas > abonoInteres) {
                return <div className={styles.distribucionError}>El interés distribuido supera el abono a interés.</div>;
              }
              
              return (
                <div className={styles.distribucionSummary} style={{ marginTop: "0.5rem", color: "#16a34a" }}>
                  <span>Ganancia para Billetera del Administrador: {formatCurrency(gananciaAdmin * 1000)}</span>
                </div>
              );
            })()}
          </div>
        )}

        <div className={styles.formGroup}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', display: 'block' }}>Método de Pago</label>
          <select
            value={pagoLibreData.metodo_pago || 'transferencia'}
            onChange={(e) => setPagoLibreData({ ...pagoLibreData, metodo_pago: e.target.value })}
            className={styles.select}
          >
            <option value="transferencia">Transferencia</option>
            <option value="efectivo">Efectivo</option>
          </select>
        </div>

        {pagoLibreData.metodo_pago === 'transferencia' && (
          <div className={styles.formGroup}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', display: 'block' }}>Comprobante de Transferencia (Opcional)</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => setArchivoPagoLibre(e.target.files[0])}
              style={{ padding: '0.5rem', border: '1px dashed #d1d5db', borderRadius: '0.375rem', width: '100%', fontSize: '0.9rem' }}
            />
          </div>
        )}

        <div className={styles.formGroup}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: '0.4rem', display: 'block' }}>
            Notas <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <textarea
            value={pagoLibreData.notas}
            onChange={(e) => setPagoLibreData({ ...pagoLibreData, notas: e.target.value })}
            className={styles.textarea}
            rows={2}
            placeholder="Ej: Abono a crédito rotativo por transferencia bancaria..."
            required
          />
        </div>

        <div className={styles.formActions}>
          <button 
            type="button" 
            onClick={onClose}
            className={styles.btnSecondary}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={uploading || isFormInvalid}
            className={styles.btnPrimary}
            style={isFormInvalid ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            {uploading ? "Procesando..." : "Registrar Pago"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
