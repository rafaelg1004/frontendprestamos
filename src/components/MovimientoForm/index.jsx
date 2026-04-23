'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { movimientosApi, perfilesApi, prestamosApi, inversionesApi } from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'
import styles from '../PrestamoForm/PrestamoForm.module.css'

const TIPOS_MOVIMIENTO = [
  { value: 'entrega_prestamo', label: 'Entrega de Préstamo', flow: 'salida' },
  { value: 'pago_cliente', label: 'Pago de Cliente', flow: 'entrada' },
  { value: 'recibo_inversion', label: 'Recibo de Inversión', flow: 'entrada' },
  { value: 'devolucion_inversion', label: 'Devolución de Inversión', flow: 'salida' }
]

export function MovimientoForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [perfiles, setPerfiles] = useState([])
  const [prestamos, setPrestamos] = useState([])
  const [inversiones, setInversiones] = useState([])
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    tipo_movimiento: '',
    perfil_id: '',
    prestamo_id: '',
    inversion_id: '',
    monto_capital: '',
    monto_interes: '0',
    metodo_pago: 'efectivo',
    observaciones: '',
    fecha_operacion: new Date().toISOString().split('T')[0]
  })

  // Cargar perfiles según tipo de movimiento
  useEffect(() => {
    const fetchPerfiles = async () => {
      if (!formData.tipo_movimiento) return
      
      try {
        setLoading(true)
        let rol = ''
        
        if (formData.tipo_movimiento === 'entrega_prestamo' || formData.tipo_movimiento === 'pago_cliente') {
          rol = 'cliente'
        } else if (formData.tipo_movimiento === 'recibo_inversion' || formData.tipo_movimiento === 'devolucion_inversion') {
          rol = 'inversionista'
        }
        
        if (rol) {
          const response = await perfilesApi.getAll({ rol })
          setPerfiles(response.data?.data || [])
        }
      } catch (err) {
        toast.error('Error al cargar perfiles')
      } finally {
        setLoading(false)
      }
    }
    
    fetchPerfiles()
    setPerfiles([])
    setFormData(prev => ({ ...prev, perfil_id: '', prestamo_id: '', inversion_id: '' }))
  }, [formData.tipo_movimiento])

  // Cargar préstamos del perfil seleccionado
  useEffect(() => {
    const fetchPrestamos = async () => {
      if (!formData.perfil_id || formData.tipo_movimiento !== 'pago_cliente') return
      
      try {
        const response = await prestamosApi.getAll({ perfil_id: formData.perfil_id, estado: 'activo' })
        setPrestamos(response.data?.data || [])
      } catch (err) {
        toast.error('Error al cargar préstamos')
      }
    }
    fetchPrestamos()
  }, [formData.perfil_id, formData.tipo_movimiento])

  // Cargar inversiones del perfil seleccionado
  useEffect(() => {
    const fetchInversiones = async () => {
      if (!formData.perfil_id || formData.tipo_movimiento !== 'devolucion_inversion') return
      
      try {
        const response = await inversionesApi.getAll({ perfil_id: formData.perfil_id, estado: 'activa' })
        setInversiones(response.data?.data || [])
      } catch (err) {
        toast.error('Error al cargar inversiones')
      }
    }
    fetchInversiones()
  }, [formData.perfil_id, formData.tipo_movimiento])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const montoCapital = parseFloat(formData.monto_capital) * 1000
      const montoInteres = parseFloat(formData.monto_interes) * 1000
      const montoTotal = montoCapital + montoInteres

      const dataToSend = {
        ...formData,
        monto_capital: montoCapital,
        monto_interes: montoInteres,
        monto_total: montoTotal
      }

      const response = await movimientosApi.create(dataToSend)
      
      if (response.data?.success) {
        toast.success('Movimiento registrado exitosamente')
        router.push('/movimientos')
      } else {
        setError('Error al registrar el movimiento')
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Error al registrar el movimiento'
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  const tipoSeleccionado = TIPOS_MOVIMIENTO.find(t => t.value === formData.tipo_movimiento)
  const showPerfiles = formData.tipo_movimiento !== ''
  const showPrestamos = formData.tipo_movimiento === 'pago_cliente' && formData.perfil_id
  const showInversiones = formData.tipo_movimiento === 'devolucion_inversion' && formData.perfil_id

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Nuevo Movimiento</h1>
        <p className={styles.subtitle}>Registra una transacción financiera</p>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Tipo de Movimiento</h2>
            <div className={styles.field}>
              <label className={styles.label}>Seleccionar Tipo *</label>
              <select
                name="tipo_movimiento"
                value={formData.tipo_movimiento}
                onChange={handleChange}
                className={styles.select}
                required
              >
                <option value="">Seleccione el tipo</option>
                {TIPOS_MOVIMIENTO.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label} ({tipo.flow === 'entrada' ? 'Entrada' : 'Salida'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {showPerfiles && (
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>
                {tipoSeleccionado?.flow === 'entrada' ? 'Origen' : 'Destino'}
              </h2>
              <div className={styles.field}>
                <label className={styles.label}>
                  {formData.tipo_movimiento === 'entrega_prestamo' || formData.tipo_movimiento === 'pago_cliente' 
                    ? 'Cliente' 
                    : 'Inversionista'} *
                </label>
                <select
                  name="perfil_id"
                  value={formData.perfil_id}
                  onChange={handleChange}
                  className={styles.select}
                  required
                  disabled={loading}
                >
                  <option value="">{loading ? 'Cargando...' : 'Seleccione'}</option>
                  {perfiles.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nombre_completo}
                    </option>
                  ))}
                </select>
              </div>

              {showPrestamos && (
                <div className={styles.field} style={{ marginTop: '1rem' }}>
                  <label className={styles.label}>Préstamo *</label>
                  <select
                    name="prestamo_id"
                    value={formData.prestamo_id}
                    onChange={handleChange}
                    className={styles.select}
                    required
                  >
                    <option value="">Seleccione el préstamo</option>
                    {prestamos.map(p => (
                      <option key={p.id} value={p.id}>
                        ${(p.monto_principal / 1000).toLocaleString()} - {p.estado}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {showInversiones && (
                <div className={styles.field} style={{ marginTop: '1rem' }}>
                  <label className={styles.label}>Inversión *</label>
                  <select
                    name="inversion_id"
                    value={formData.inversion_id}
                    onChange={handleChange}
                    className={styles.select}
                    required
                  >
                    <option value="">Seleccione la inversión</option>
                    {inversiones.map(i => (
                      <option key={i.id} value={i.id}>
                        ${(i.monto / 1000).toLocaleString()} - {i.estado}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Montos</h2>
            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label}>Monto Capital ($) *</label>
                <input
                  type="number"
                  name="monto_capital"
                  value={formData.monto_capital}
                  onChange={handleChange}
                  placeholder="Ej: 500000"
                  className={styles.input}
                  min="0"
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Monto Interés ($)</label>
                <input
                  type="number"
                  name="monto_interes"
                  value={formData.monto_interes}
                  onChange={handleChange}
                  placeholder="Ej: 50000"
                  className={styles.input}
                  min="0"
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Detalles</h2>
            <div className={styles.row2}>
              <div className={styles.field}>
                <label className={styles.label}>Método de Pago *</label>
                <select
                  name="metodo_pago"
                  value={formData.metodo_pago}
                  onChange={handleChange}
                  className={styles.select}
                  required
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Fecha *</label>
                <input
                  type="date"
                  name="fecha_operacion"
                  value={formData.fecha_operacion}
                  onChange={handleChange}
                  className={styles.input}
                  required
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Observaciones</h2>
            <div className={styles.field}>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                placeholder="Notas adicionales..."
                className={styles.textarea}
                rows={3}
              />
            </div>
          </div>

          <div className={styles.actions}>
            <Link href="/movimientos" className={styles.btnSecondary}>
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className={styles.btnPrimary}
            >
              {saving ? 'Guardando...' : 'Registrar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
