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
        const montoInteres = Math.round(interes * proporcion * proporcionInteres);
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
              <span>El sistema calculó el interés por inversionista según su tasa pactada. Lo que sobre irá a la billetera de la inversionista principal (Yesika).</span>
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
                  <span>Ganancia para Billetera Principal (Yesika): {formatCurrency(gananciaAdmin * 1000)}</span>
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
