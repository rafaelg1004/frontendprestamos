"use client";

import { useState, useEffect } from "react";
import { 
  Calculator, 
  DollarSign, 
  Calendar, 
  Percent, 
  TrendingUp,
  Info
} from "lucide-react";
import { formatCurrency, formatInputNumber, parseNumber } from "@/lib/utils";
import styles from "./SimuladorView.module.css";

export function SimuladorView() {
  const [monto, setMonto] = useState("1.000.000");
  const [tasa, setTasa] = useState(20);
  const [plazo, setPlazo] = useState(1);
  const [frecuencia, setFrecuencia] = useState("mensual");
  const [tipoAmortizacion, setTipoAmortizacion] = useState("frances"); // frances o flat
  const [cuotas, setCuotas] = useState([]);
  const [resumen, setResumen] = useState({
    cuotaMonto: 0,
    totalIntereses: 0,
    totalPagar: 0,
    numCuotas: 0
  });

  useEffect(() => {
    calcularAmortizacion();
  }, [monto, tasa, plazo, frecuencia, tipoAmortizacion]);

  useEffect(() => {
    // Al cambiar la frecuencia, ajustamos el plazo para que sea 1 mes por defecto
    const autoPlazo = {
      diario: 30,
      semanal: 4,
      quincenal: 2,
      mensual: 1
    };
    setPlazo(autoPlazo[frecuencia]);
  }, [frecuencia]);

  const getLabelPlazo = () => {
    switch (frecuencia) {
      case "diario": return "Duración (Días)";
      case "semanal": return "Duración (Semanas)";
      case "quincenal": return "Duración (Quincenas)";
      default: return "Duración (Meses)";
    }
  };

  const calcularAmortizacion = () => {
    const p = parseNumber(monto);
    const tasaMensual = parseFloat(tasa) / 100;
    
    // Multiplicadores según frecuencia
    let multiplier = 1;
    if (frecuencia === "diario") multiplier = 30;
    else if (frecuencia === "semanal") multiplier = 4;
    else if (frecuencia === "quincenal") multiplier = 2;

    const n = parseInt(plazo) || 0; // Número total de cuotas
    const r = tasaMensual / multiplier; // Tasa por período
    
    let table = [];
    let totalIntereses = 0;

    if (tipoAmortizacion === "frances") {
      const cuotaMonto = Math.round(p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
      let saldoPendiente = p;
      for (let i = 1; i <= n; i++) {
        const interesCuota = Math.round((saldoPendiente * r) / 1000) * 1000;
        let capitalCuota = cuotaMonto - interesCuota;
        if (i === n) capitalCuota = saldoPendiente;
        saldoPendiente -= capitalCuota;
        totalIntereses += interesCuota;
        table.push({
          numero: i,
          capital: capitalCuota,
          interes: interesCuota,
          total: capitalCuota + interesCuota,
          saldo: Math.max(0, saldoPendiente)
        });
      }
    } else {
      const totalInteresPlan = Math.round((p * tasaMensual * (n / multiplier)) / 1000) * 1000;
      const interesPorCuotaBase = Math.round((totalInteresPlan / n) / 1000) * 1000;
      const capitalPorCuotaBase = Math.round((p / n) / 1000) * 1000;
      
      let saldoCapital = p;
      let saldoInteres = totalInteresPlan;

      for (let i = 1; i <= n; i++) {
        let currentCapital = capitalPorCuotaBase;
        let currentInteres = interesPorCuotaBase;

        if (i === n) {
          currentCapital = saldoCapital;
          currentInteres = saldoInteres;
        } else {
          currentCapital = Math.min(currentCapital, saldoCapital);
          currentInteres = Math.min(currentInteres, saldoInteres);
        }

        saldoCapital -= currentCapital;
        saldoInteres -= currentInteres;
        totalIntereses += currentInteres;

        table.push({
          numero: i,
          capital: currentCapital,
          interes: currentInteres,
          total: currentCapital + currentInteres,
          saldo: Math.max(0, saldoCapital)
        });
      }
    }

    setCuotas(table);
    setResumen({
      cuotaMonto: table[0]?.total || 0,
      totalIntereses: totalIntereses,
      totalPagar: p + totalIntereses,
      numCuotas: n
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Simulador de Préstamos</h1>
          <p className={styles.subtitle}>Proyecta y negocia las condiciones con tu cliente</p>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Panel de Configuración */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <Calculator size={20} className={styles.iconBlue} />
            Parámetros del Préstamo
          </h3>

          <div className={styles.formGroup}>
            <label className={styles.label}>Monto a Prestar</label>
            <div className={styles.inputGroup}>
              <DollarSign size={18} className={styles.inputIcon} />
              <input 
                type="text" 
                className={styles.input}
                value={monto}
                onChange={(e) => setMonto(formatInputNumber(e.target.value))}
                placeholder="Ej. 5.000.000"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Tasa de Interés (% Mensual)</label>
            <div className={styles.inputGroup}>
              <Percent size={18} className={styles.inputIcon} />
              <input 
                type="number" 
                step="0.1"
                className={styles.input}
                value={tasa}
                onChange={(e) => setTasa(e.target.value)}
                placeholder="Ej. 20"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Frecuencia de Pago</label>
            <select 
              className={styles.select}
              value={frecuencia}
              onChange={(e) => setFrecuencia(e.target.value)}
            >
              <option value="diario">Diario</option>
              <option value="semanal">Semanal</option>
              <option value="quincenal">Quincenal</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>{getLabelPlazo()}</label>
            <div className={styles.inputGroup}>
              <Calendar size={18} className={styles.inputIcon} />
              <input 
                type="number" 
                className={styles.input}
                value={plazo}
                onChange={(e) => setPlazo(e.target.value)}
                placeholder="Ej. 30"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Sistema de Amortización</label>
            <select 
              className={styles.select}
              value={tipoAmortizacion}
              onChange={(e) => setTipoAmortizacion(e.target.value)}
            >
              <option value="frances">Sistema Francés (Cuota Fija)</option>
              <option value="flat">Sistema Flat (Interés Fijo)</option>
            </select>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Info size={10} /> El sistema francés reduce el interés a medida que se paga capital.
            </p>
          </div>

          <div className={styles.summary}>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total de Cuotas:</span>
              <span className={styles.summaryValue}>{resumen.numCuotas}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Valor de cada Cuota:</span>
              <span className={`${styles.summaryValue} ${styles.totalValue}`}>{formatCurrency(resumen.cuotaMonto * 1000)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total Intereses:</span>
              <span className={styles.summaryValue}>{formatCurrency(resumen.totalIntereses * 1000)}</span>
            </div>
            <div className={styles.summaryItem}>
              <span className={styles.summaryLabel}>Total a Pagar:</span>
              <span className={styles.summaryValue}>{formatCurrency(resumen.totalPagar * 1000)}</span>
            </div>
          </div>
        </div>

        {/* Tabla de Resultados */}
        <div className={`${styles.card} ${styles.resultsCard}`}>
          <h3 className={styles.cardTitle}>
            <TrendingUp size={20} className={styles.iconGreen} />
            Tabla de Amortización Proyectada
          </h3>

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Capital</th>
                  <th>Interés</th>
                  <th>Cuota Total</th>
                  <th>Saldo Pendiente</th>
                </tr>
              </thead>
              <tbody>
                {cuotas.map((c) => (
                  <tr key={c.numero}>
                    <td className={styles.cuotaNum}>{c.numero}</td>
                    <td className={styles.amountCapital}>{formatCurrency(c.capital * 1000)}</td>
                    <td className={styles.amountInteres}>{formatCurrency(c.interes * 1000)}</td>
                    <td className={styles.amountTotal}>{formatCurrency(c.total * 1000)}</td>
                    <td className={styles.textMuted}>{formatCurrency(c.saldo * 1000)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
