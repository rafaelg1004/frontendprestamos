'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { perfilesApi, prestamosApi, inversionesApi } from '@/lib/api'
import { 
  ArrowLeft, 
  User, 
  TrendingUp, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard,
  Plus,
  Wallet
} from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './PersonaDetalleView.module.css'

export function PersonaDetalleView({ id }) {
  const router = useRouter()
  const [persona, setPersona] = useState(null)
  const [operaciones, setOperaciones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Obtener datos de la persona
      const personaRes = await perfilesApi.getById(id)
      const personaData = personaRes.data?.data
      setPersona(personaData)

      // Obtener operaciones según el rol
      if (personaData?.rol === 'cliente') {
        const prestamosRes = await prestamosApi.getAll({ cliente_id: id })
        setOperaciones(prestamosRes.data?.data || [])
      } else if (personaData?.rol === 'inversionista') {
        const inversionesRes = await inversionesApi.getAll({ inversionista_id: id })
        setOperaciones(inversionesRes.data?.data || [])
      }
    } catch (error) {
      toast.error('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>
  }

  if (!persona) {
    return (
      <div className={styles.empty}>
        <p>Persona no encontrada</p>
        <Link href="/personas" className={styles.btnSecondary}>
          Volver a la lista
        </Link>
      </div>
    )
  }

  const esCliente = persona.rol === 'cliente'
  const tituloOperaciones = esCliente ? 'Préstamos' : 'Inversiones'
  const btnNuevo = esCliente ? 'Nuevo Préstamo' : 'Nueva Inversión'
  const linkNuevo = esCliente ? `/prestamos/nuevo?cliente=${id}` : `/inversiones/nueva?inversionista=${id}`
  const IconoRol = esCliente ? User : TrendingUp

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <Link href="/personas" className={styles.backLink}>
          <ArrowLeft size={20} />
          Volver a Personas
        </Link>
      </div>

      {/* Info Card */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.avatar}>
            <IconoRol size={32} />
          </div>
          <div className={styles.headerInfo}>
            <h1 className={styles.nombre}>{persona.nombre_completo}</h1>
            <span className={`${styles.rol} ${styles[persona.rol]}`}>
              {esCliente ? 'Cliente' : 'Inversionista'}
            </span>
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <Mail size={18} />
            <div>
              <label>Email</label>
              <span>{persona.email}</span>
            </div>
          </div>
          <div className={styles.infoItem}>
            <Phone size={18} />
            <div>
              <label>Teléfono</label>
              <span>{persona.telefono || 'No registrado'}</span>
            </div>
          </div>
          <div className={styles.infoItem}>
            <CreditCard size={18} />
            <div>
              <label>Identificación</label>
              <span>{persona.identificacion || 'No registrada'}</span>
            </div>
          </div>
          <div className={styles.infoItem}>
            <MapPin size={18} />
            <div>
              <label>Dirección</label>
              <span>{persona.direccion || 'No registrada'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Operaciones Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>
            {esCliente ? <Wallet size={22} /> : <TrendingUp size={22} />}
            {tituloOperaciones}
          </h2>
          <Link href={linkNuevo} className={styles.btnPrimary}>
            <Plus size={18} />
            {btnNuevo}
          </Link>
        </div>

        {operaciones.length === 0 ? (
          <div className={styles.emptySection}>
            <p>No hay {tituloOperaciones.toLowerCase()} registrados</p>
            <Link href={linkNuevo} className={styles.btnSecondary}>
              Crear {esCliente ? 'primer préstamo' : 'primera inversión'}
            </Link>
          </div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{esCliente ? 'Monto Préstamo' : 'Monto Inversión'}</th>
                  <th>{esCliente ? 'Tasa Interés' : 'Tasa Retorno'}</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {operaciones.map((op) => (
                  <tr key={op.id}>
                    <td>
                      ${(esCliente ? op.monto_principal : op.monto_invertido)?.toLocaleString()}
                    </td>
                    <td>
                      {esCliente ? op.tasa_interes_mensual : op.tasa_interes_pactada}%
                    </td>
                    <td>
                      <span className={`${styles.estado} ${styles[op.estado]}`}>
                        {op.estado}
                      </span>
                    </td>
                    <td>
                      {new Date(esCliente ? op.fecha_inicio : op.fecha_inversion).toLocaleDateString('es-ES')}
                    </td>
                    <td>
                      <Link 
                        href={esCliente ? `/prestamos/${op.id}` : `/inversiones/${op.id}`}
                        className={styles.btnView}
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
