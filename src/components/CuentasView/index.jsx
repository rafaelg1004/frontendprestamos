'use client'

import { useState, useEffect } from 'react'
import { cuentasApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { Wallet, Plus, Trash2, Landmark, CreditCard, Banknote, RefreshCw, AlertCircle, Eye } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import styles from './CuentasView.module.css'

export function CuentasView() {
  const [cuentas, setCuentas] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncingId, setSyncingId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({ nombre: '', tipo: 'ahorros' })

  useEffect(() => {
    fetchCuentas()
  }, [])

  const fetchCuentas = async () => {
    try {
      setLoading(true)
      const { data } = await cuentasApi.getAll({ incluir_billeteras: true })
      setCuentas(data.data || [])
    } catch (error) {
      toast.error('Error al cargar cuentas')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async (id) => {
    try {
      setSyncingId(id)
      await cuentasApi.sincronizar(id)
      toast.success('Saldo sincronizado correctamente')
      fetchCuentas()
    } catch (error) {
      toast.error('Error al sincronizar saldo')
    } finally {
      setSyncingId(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await cuentasApi.create(formData)
      toast.success('Cuenta creada exitosamente')
      setShowModal(false)
      setFormData({ nombre: '', tipo: 'ahorros' })
      fetchCuentas()
    } catch (error) {
      toast.error('Error al crear cuenta')
    }
  }

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar la cuenta ${nombre}?`)) {
      try {
        await cuentasApi.delete(id)
        toast.success('Cuenta eliminada')
        fetchCuentas()
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error al eliminar cuenta')
      }
    }
  }

  const getAccountIcon = (tipo) => {
    switch (tipo) {
      case 'efectivo': return <Banknote size={24} />
      case 'digital': return <Landmark size={24} />
      default: return <CreditCard size={24} />
    }
  }

  if (loading) return <div className={styles.loading}>Cargando cuentas...</div>

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <Wallet size={28} />
            Cuentas y Saldos
          </h1>
          <p className={styles.subtitle}>Gestiona tus fuentes de dinero</p>
        </div>
        <button onClick={() => setShowModal(true)} className={styles.btnPrimary}>
          <Plus size={20} />
          Nueva Cuenta
        </button>
      </div>

      <div className={styles.grid}>
        {cuentas.map((cuenta) => (
          <div key={cuenta.id} className={`${styles.card} ${cuenta.saldo_actual < 0 ? styles.cardWarning : ''}`}>
            <div className={styles.cardHeader}>
              <div className={styles.iconWrapper}>
                {getAccountIcon(cuenta.tipo)}
              </div>
              <div className={styles.cardActions}>
                <Link
                  href={`/cuentas/${cuenta.id}`}
                  className={styles.btnView}
                  title="Ver movimientos"
                  style={{ color: '#4f46e5', background: '#e0e7ff', padding: '0.5rem', borderRadius: '0.375rem', display: 'flex', alignItems: 'center' }}
                >
                  <Eye size={18} />
                </Link>
                <button 
                  onClick={() => handleSync(cuenta.id)}
                  className={`${styles.btnSync} ${syncingId === cuenta.id ? styles.spinning : ''}`}
                  title="Sincronizar saldo con movimientos"
                  disabled={syncingId === cuenta.id}
                >
                  <RefreshCw size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(cuenta.id, cuenta.nombre)}
                  className={styles.btnDelete}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className={styles.cardBody}>
              <h3 className={styles.accountName}>{cuenta.nombre}</h3>
              <p className={styles.accountType}>{cuenta.tipo}</p>
              <div className={styles.balanceSection}>
                <p className={`${styles.balance} ${cuenta.saldo_actual < 0 ? styles.negative : ''}`}>
                  {formatCurrency(cuenta.saldo_actual)}
                </p>
                {cuenta.saldo_actual < 0 && (
                  <div className={styles.warningMessage}>
                    <AlertCircle size={14} />
                    Saldo inconsistente
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Nueva Cuenta</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label>Nombre de la Cuenta</label>
                <input 
                  type="text" 
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ej: Nequi, Caja Fuerte, Bancolombia"
                  required
                />
              </div>
              <div className={styles.field}>
                <label>Tipo</label>
                <select 
                  value={formData.tipo}
                  onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                >
                  <option value="ahorros">Ahorros</option>
                  <option value="digital">Billetera Digital</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="corriente">Corriente</option>
                </select>
              </div>
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className={styles.btnPrimary}>Crear Cuenta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
