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
  onSubmit
}) {
  const calculos = prestamo?.calculos;

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
        // Redondear hacia abajo a los 100 pesos más cercanos para favorecer al admin (100 pesos = 100,000 milunidades)
        const montoInteres = Math.floor(interesExacto / 100000) * 100000;
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
        <div className={styles.infoBar} style={{ marginBottom: "1rem" }}>
          <div className={styles.infoBarItem}>
            <span className={styles.infoBarLabel}>Deuda de Interés</span>
            <span className={styles.infoBarValue}>{formatCurrency(calculos.interes_total_deuda)}</span>
          </div>
          <div className={styles.infoBarItem}>
            <span className={styles.infoBarLabel}>Capital Actual</span>
            <span className={styles.infoBarValue}>{formatCurrency(calculos.capital_pendiente)}</span>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup} style={{ marginBottom: "1rem" }}>
            <label>Abono a Capital</label>
            <div className={styles.distribucionInputWrapper}>
              <span className={styles.distribucionCurrency}>$</span>
              <input
                type="text"
                value={formatInputNumber(pagoLibreData.monto_capital)}
                className={styles.distribucionInput}
                onChange={(e) => setPagoLibreData({ ...pagoLibreData, monto_capital: parseNumber(e.target.value) })}
                placeholder="0"
              />
            </div>
          </div>
          
          <div className={styles.formGroup} style={{ marginBottom: "1rem" }}>
            <label>Abono a Intereses</label>
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
            
            <div 
              style={{ 
                marginTop: '1rem', 
                padding: '0.85rem', 
                borderRadius: '8px', 
                border: pagoLibreData.condonar_intereses ? '1px solid #3b82f6' : '1px solid #e2e8f0', 
                backgroundColor: pagoLibreData.condonar_intereses ? '#eff6ff' : '#f8fafc',
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out'
              }}
              onClick={() => setPagoLibreData({ ...pagoLibreData, condonar_intereses: !pagoLibreData.condonar_intereses })}
            >
              <div style={{ marginTop: '0.15rem' }}>
                <input 
                  type="checkbox" 
                  id="condonar"
                  checked={pagoLibreData.condonar_intereses}
                  onChange={(e) => setPagoLibreData({ ...pagoLibreData, condonar_intereses: e.target.checked })}
                  style={{ 
                    width: '1.1rem', 
                    height: '1.1rem', 
                    cursor: 'pointer',
                    accentColor: '#3b82f6'
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label 
                  htmlFor="condonar" 
                  style={{ 
                    fontSize: '0.85rem', 
                    color: pagoLibreData.condonar_intereses ? '#1e40af' : '#475569', 
                    cursor: 'pointer', 
                    lineHeight: '1.4',
                    display: 'block'
                  }}
                  onClick={(e) => e.preventDefault()}
                >
                  <strong style={{ color: pagoLibreData.condonar_intereses ? '#1e3a8a' : '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: pagoLibreData.condonar_intereses ? '#3b82f6' : '#94a3b8' }}>
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                    Condonar intereses restantes
                  </strong>
                  Si activas esta opción, la deuda de interés bajará a $0 automáticamente sin importar el monto que pagues hoy.
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.formGroup} style={{ marginBottom: "1rem" }}>
            <label>Cuenta Destino Capital *</label>
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
          <label>Notas</label>
          <textarea
            value={pagoLibreData.notas}
            onChange={(e) => setPagoLibreData({ ...pagoLibreData, notas: e.target.value })}
            className={styles.textarea}
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
            disabled={uploading || (!pagoLibreData.monto_capital && !pagoLibreData.monto_interes)}
            className={styles.btnPrimary}
          >
            {uploading ? "Procesando..." : "Registrar Pago"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
