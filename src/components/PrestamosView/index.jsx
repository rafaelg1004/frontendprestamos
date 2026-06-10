'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { perfilesApi, prestamosApi } from '@/lib/api'
import { formatCurrency, formatDate, calcularDiasMora, getEstadoBadge } from '@/lib/utils'
import { Plus, Search, AlertTriangle, Eye, Filter, Calendar, TrendingUp, Users, ChevronDown, ChevronUp, RefreshCw, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { Modal } from '../Modal'
import { PrestamoDetalleView } from '../PrestamoDetalleView'
import styles from './PrestamosView.module.css'

export function PrestamosView() {
  const searchParams = useSearchParams()
  const estadoFromUrl = searchParams.get('estado')

  const [prestamos, setPrestamos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroEstado, setFiltroEstado] = useState(estadoFromUrl || '')
  const [filtroInversionista, setFiltroInversionista] = useState('')
  const [filtroTasa, setFiltroTasa] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [inversionistas, setInversionistas] = useState([])
  const [tasasDisponibles, setTasasDisponibles] = useState([])
  const [selectedPrestamoId, setSelectedPrestamoId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [invRes, filterRes] = await Promise.all([
          perfilesApi.getAll({ rol: 'inversionista', limit: 1000 }),
          prestamosApi.getFiltros()
        ])
        setInversionistas(invRes.data.data || [])
        setTasasDisponibles(filterRes.data.data.tasas || [])
      } catch (error) {
        console.error('Error fetching metadata:', error)
      }
    }
    fetchMetadata()
  }, [])

  useEffect(() => {
    const fetchPrestamos = async () => {
      try {
        setLoading(true)
        const params = { limit: 1000 }
        if (filtroEstado) params.estado = filtroEstado
        if (filtroInversionista) params.inversionista_id = filtroInversionista
        if (filtroTasa) params.tasa_interes = filtroTasa
        if (fechaDesde) params.fecha_desde = fechaDesde
        if (fechaHasta) params.fecha_hasta = fechaHasta
        
        const { data } = await prestamosApi.getAll(params)
        setPrestamos(data.data || [])
      } catch (error) {
        console.error('Error fetching prestamos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPrestamos()
  }, [filtroEstado, filtroInversionista, filtroTasa, fechaDesde, fechaHasta])

  const [soloMora, setSoloMora] = useState(false)

  const filteredPrestamos = prestamos.filter(p => {
    const matchSearch = p.cliente?.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase())
    if (!matchSearch) return false
    if (soloMora) {
      const diasMora = calcularDiasMora(p.fecha_vencimiento)
      return diasMora > 0 && p.estado === 'activo'
    }
    return true
  })

  const openDetalle = (id) => {
    setSelectedPrestamoId(id)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este préstamo y todos sus registros (cuotas, movimientos)? Esta acción no se puede deshacer.")) {
      try {
        await prestamosApi.delete(id)
        setPrestamos(prestamos.filter(p => p.id !== id))
        alert("Préstamo eliminado exitosamente.")
      } catch (error) {
        console.error('Error eliminando préstamo:', error)
        alert("Error al eliminar el préstamo.")
      }
    }
  }

  const getProximoCorte = (p) => {
    if (!p) return null;
    const d = new Date(p.fecha_ultimo_corte || p.fecha_inicio);
    return new Date(d.getFullYear(), d.getMonth() + 1, d.getDate()).toISOString();
  };

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
              <button
                onClick={() => setSoloMora(!soloMora)}
                className={styles.moraText}
                style={{
                  cursor: 'pointer',
                  background: soloMora ? '#dc2626' : '#fee2e2',
                  color: soloMora ? 'white' : '#dc2626',
                  border: '1px solid #dc2626',
                  borderRadius: '0.375rem',
                  padding: '0.25rem 0.75rem',
                  fontWeight: 600,
                  fontSize: '0.875rem'
                }}
              >
                {prestamosEnMora.length} en mora {soloMora ? '✕' : ''}
              </button>
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
          {/* Fila Principal: Buscador y Estado */}
          <div className={styles.mainActions}>
            <div className={styles.searchBox}>
              <Search className={styles.searchIcon} size={18} />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.input}
              />
            </div>

            <div className={styles.primaryFilters}>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className={styles.selectStatus}
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="pagado">Pagado</option>
                <option value="mora">En Mora</option>
              </select>

              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`${styles.btnToggleFilters} ${showFilters ? styles.active : ''}`}
              >
                <Filter size={16} />
                Filtros
                {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>

          {/* Fila Secundaria: Filtros Avanzados (Colapsable) */}
          {showFilters && (
            <div className={styles.advancedFilters}>
              <div className={styles.filterGroup}>
                <div className={styles.filterLabel}>Inversionista</div>
                <div className={styles.filterInputWrapper}>
                  <Users size={14} className={styles.filterIcon} />
                  <select
                    value={filtroInversionista}
                    onChange={(e) => setFiltroInversionista(e.target.value)}
                    className={styles.selectSmall}
                  >
                    <option value="">Todos</option>
                    {inversionistas.map(inv => (
                      <option key={inv.id} value={inv.id}>{inv.nombre_completo}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.filterGroup}>
                <div className={styles.filterLabel}>Interés</div>
                <div className={styles.filterInputWrapper}>
                  <TrendingUp size={14} className={styles.filterIcon} />
                  <select
                    value={filtroTasa}
                    onChange={(e) => setFiltroTasa(e.target.value)}
                    className={styles.selectSmall}
                  >
                    <option value="">Todos</option>
                    {tasasDisponibles.map(tasa => (
                      <option key={tasa} value={tasa}>{tasa}%</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.filterGroup}>
                <div className={styles.filterLabel}>Rango de Fecha</div>
                <div className={styles.dateRange}>
                  <Calendar size={14} className={styles.filterIcon} />
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className={styles.dateInput}
                  />
                  <span className={styles.dateDivider}>-</span>
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className={styles.dateInput}
                  />
                </div>
              </div>

              {(filtroInversionista || filtroTasa || fechaDesde || fechaHasta) && (
                <button 
                  onClick={() => {
                    setFiltroInversionista('')
                    setFiltroTasa('')
                    setFechaDesde('')
                    setFechaHasta('')
                  }}
                  className={styles.btnClearAdvanced}
                >
                  <RefreshCw size={14} />
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>

        <div className={styles.desktopView}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Monto</th>
                  <th>Fecha Entrega</th>
                  <th>Próximo Corte</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrestamos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.emptyState}>
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
                          {formatDate(prestamo.fecha_inicio)}
                        </td>
                        <td>
                          <div className={styles.vencimientoCell}>
                            {formatDate(getProximoCorte(prestamo))}
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
                        <td className={styles.actionsCell} style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={() => openDetalle(prestamo.id)} 
                            className={styles.btnView}
                          >
                            <Eye size={16} />
                            Detalle
                          </button>
                          <button 
                            onClick={() => handleDelete(prestamo.id)} 
                            className={styles.btnView}
                            style={{ color: '#dc2626', borderColor: '#fecaca', background: '#fef2f2' }}
                          >
                            <Trash2 size={16} />
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile View */}
        <div className={styles.mobileView}>
          <div className={styles.cardGrid}>
            {filteredPrestamos.map((prestamo) => {
              const diasMora = calcularDiasMora(prestamo.fecha_vencimiento)
              const badge = getEstadoBadge(prestamo.estado)
              const isMora = diasMora > 0 && prestamo.estado === 'activo'
              
              return (
                <div key={prestamo.id} onClick={() => openDetalle(prestamo.id)} className={styles.mobileCard}>
                  <div className={styles.mobileCardHeader}>
                    <div className={styles.mobileClientInfo}>
                      <span className={styles.mobileClientName}>{prestamo.cliente?.nombre_completo}</span>
                      <span className={styles.mobileDate}>{formatDate(prestamo.fecha_inicio)}</span>
                    </div>
                    <span className={`${styles.badge} ${styles[badge.className]}`}>
                      {badge.label}
                    </span>
                  </div>
                  
                  <div className={styles.mobileCardBody}>
                    <div className={styles.mobileMontoSection}>
                      <span className={styles.mobileLabel}>Capital prestado</span>
                      <span className={styles.mobileMonto}>{formatCurrency(prestamo.monto_principal)}</span>
                    </div>
                    <div className={styles.mobileDetailsGrid}>
                      <div className={styles.mobileDetailItem}>
                        <span className={styles.mobileSubLabel}>Interés</span>
                        <span>{prestamo.tasa_interes_mensual}%</span>
                      </div>
                      <div className={styles.mobileDetailItem}>
                        <span className={styles.mobileSubLabel}>Próximo Corte</span>
                        <span>{formatDate(getProximoCorte(prestamo))}</span>
                      </div>
                    </div>
                  </div>

                  {isMora && (
                    <div className={styles.mobileMoraAlert}>
                      <AlertTriangle size={16} />
                      <span>{diasMora} días de retraso</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Modal de Detalle de Préstamo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Detalle del Préstamo"
        size="xl"
      >
        {selectedPrestamoId && (
          <PrestamoDetalleView id={selectedPrestamoId} isModal={true} />
        )}
      </Modal>
    </div>
  )
}
