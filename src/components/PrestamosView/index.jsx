'use client'

import { useEffect, useState } from 'react'
import { prestamosApi } from '@/lib/api'
import { formatCurrency, formatDate, calcularDiasMora, getEstadoBadge } from '@/lib/utils'
import { Plus, Search, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import styles from './PrestamosView.module.css'

export function PrestamosView() {
  const [prestamos, setPrestamos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')

  useEffect(() => {
    const fetchPrestamos = async () => {
      try {
        const params = {}
        if (filtroEstado) params.estado = filtroEstado
        const { data } = await prestamosApi.getAll(params)
        setPrestamos(data.data || [])
      } catch (error) {
        console.error('Error fetching prestamos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrestamos()
  }, [filtroEstado])

  const filteredPrestamos = prestamos.filter(p => 
    p.cliente?.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const prestamosEnMora = filteredPrestamos.filter(p => {
    const diasMora = calcularDiasMora(p.fecha_vencimiento)
    return diasMora > 0 && p.estado === 'activo'
  })

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <div className={styles.loadingSkeleton} style={{ width: '200px', height: '2rem' }}></div>
          </div>
        </div>
        <div className={styles.card}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={styles.loadingSkeleton}></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Préstamos</h1>
          <p className={styles.subtitle}>
            {prestamosEnMora.length > 0 && (
              <span className={styles.moraText}>
                {prestamosEnMora.length} en mora
              </span>
            )}
          </p>
        </div>
        <Link href="/prestamos/nuevo" className={styles.btnPrimary}>
          <Plus size={20} />
          Nuevo Préstamo
        </Link>
      </div>

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Buscar por cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.input}
            />
          </div>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className={styles.select}
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="pagado">Pagado</option>
            <option value="mora">En Mora</option>
          </select>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Monto</th>
                <th>Vencimiento</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrestamos.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>
                    No se encontraron préstamos
                  </td>
                </tr>
              ) : (
                filteredPrestamos.map((prestamo) => {
                  const diasMora = calcularDiasMora(prestamo.fecha_vencimiento)
                  const badge = getEstadoBadge(prestamo.estado)
                  const isMora = diasMora > 0 && prestamo.estado === 'activo'
                  
                  return (
                    <tr 
                      key={prestamo.id} 
                      className={isMora ? styles.moraRow : ''}
                    >
                      <td>
                        <div className={styles.clientCell}>
                          <span className={styles.clientName}>
                            {prestamo.cliente?.nombre_completo}
                          </span>
                          <span className={styles.clientEmail}>
                            {prestamo.cliente?.email}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.montoCell}>
                          <span className={styles.montoPrincipal}>
                            {formatCurrency(prestamo.monto_principal)}
                          </span>
                          <span className={styles.tasa}>
                            {prestamo.tasa_interes_mensual}% mensual
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.vencimientoCell}>
                          {formatDate(prestamo.fecha_vencimiento)}
                          {isMora && (
                            <span className={styles.moraBadge}>
                              <AlertTriangle size={12} />
                              {diasMora} días mora
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${styles[badge.className]}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className={styles.actionsCell}>
                        <Link href={`/prestamos/${prestamo.id}`} className={styles.link}>
                          Ver detalle →
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
