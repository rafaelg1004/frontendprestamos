'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { perfilesApi } from '@/lib/api'
import { Users, Plus, Search, User, TrendingUp, Filter, Edit, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { Modal } from '../Modal'
import { PersonaDetalleView } from '../PersonaDetalleView'
import styles from './PersonasView.module.css'

export function PersonasView() {
  const [personas, setPersonas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroRol, setFiltroRol] = useState('') // '' = todos, 'cliente', 'inversionista'
  const [busqueda, setBusqueda] = useState('')
  const [selectedPersonaId, setSelectedPersonaId] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchPersonas()
  }, [filtroRol])

  const fetchPersonas = async () => {
    try {
      setLoading(true)
      const params = { limit: 1000 }
      if (filtroRol) params.rol = filtroRol
      
      const response = await perfilesApi.getAll(params)
      setPersonas(response.data?.data || [])
    } catch (error) {
      toast.error('Error al cargar personas')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar a ${nombre}? Esta acción no se puede deshacer.`)) {
      try {
        await perfilesApi.delete(id)
        toast.success('Persona eliminada exitosamente')
        fetchPersonas()
      } catch (error) {
        toast.error('Error al eliminar la persona')
      }
    }
  }

  const personasFiltradas = personas.filter(p => 
    p.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.identificacion?.includes(busqueda)
  )

  const openDetalle = (id) => {
    setSelectedPersonaId(id)
    setIsModalOpen(true)
  }

  const stats = {
    total: personas.length,
    clientes: personas.filter(p => p.rol === 'cliente').length,
    inversionistas: personas.filter(p => p.rol === 'inversionista').length
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            <Users size={28} />
            Personas
          </h1>
          <p className={styles.subtitle}>Gestiona clientes e inversionistas</p>
        </div>
        <Link href="/personas/nueva" className={styles.btnPrimary}>
          <Plus size={20} />
          Nueva Persona
        </Link>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#dbeafe', color: '#2563eb' }}>
            <Users size={24} />
          </div>
          <div>
            <p className={styles.statValue}>{stats.total}</p>
            <p className={styles.statLabel}>Total Personas</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#dcfce7', color: '#16a34a' }}>
            <User size={24} />
          </div>
          <div>
            <p className={styles.statValue}>{stats.clientes}</p>
            <p className={styles.statLabel}>Clientes</p>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: '#fef3c7', color: '#d97706' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <p className={styles.statValue}>{stats.inversionistas}</p>
            <p className={styles.statLabel}>Inversionistas</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre o identificación..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterGroup}>
          <Filter size={18} />
          <select 
            value={filtroRol} 
            onChange={(e) => setFiltroRol(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Todos los roles</option>
            <option value="cliente">Solo Clientes</option>
            <option value="inversionista">Solo Inversionistas</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className={styles.loading}>Cargando...</div>
      ) : personas.length === 0 ? (
        <div className={styles.emptyState}>
          <Users size={48} />
          <p>No se encontraron personas</p>
          <Link href="/personas/nuevo" className={styles.btnPrimary}>
            Crear la primera persona
          </Link>
        </div>
      ) : (
        <>
          {/* Vista de Tabla para Desktop */}
          <div className={styles.desktopView}>
            <div className="table-container">
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Identificación</th>
                    <th>Teléfono</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {personasFiltradas.map((persona) => (
                    <tr key={persona.id}>
                      <td>
                        <div className={styles.nameCell}>
                          <div className={styles.avatar}>
                            {persona.nombre_completo?.charAt(0).toUpperCase()}
                          </div>
                          <span>{persona.nombre_completo}</span>
                        </div>
                      </td>
                      <td>{persona.identificacion}</td>
                      <td className={styles.phone}>{persona.telefono || '-'}</td>
                      <td>
                        <span className={`${styles.roleBadge} ${styles[persona.rol]}`}>
                          {persona.rol === 'cliente' ? 'Cliente' : 'Inversionista'}
                        </span>
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles.activo}`}>
                          Activo
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button 
                            onClick={() => openDetalle(persona.id)} 
                            className={styles.btnView} 
                            title="Ver detalles"
                          >
                            <Eye size={16} />
                            Detalle
                          </button>
                          <Link href={`/personas/${persona.id}/editar`} className={styles.btnEdit} title="Editar">
                            <Edit size={16} />
                          </Link>
                          <button 
                            onClick={() => handleDelete(persona.id, persona.nombre_completo)}
                            className={styles.btnDelete}
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vista de Tarjetas para Móvil */}
          <div className={styles.mobileView}>
            <div className={styles.cardGrid}>
              {personasFiltradas.map((persona) => (
                <div key={persona.id} className={styles.mobileCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardInfo}>
                      <h3>{persona.nombre_completo}</h3>
                      <span className={`${styles.roleBadge} ${styles[persona.rol]}`}>
                        {persona.rol === 'cliente' ? 'Cliente' : 'Inversionista'}
                      </span>
                    </div>
                    <div className={styles.cardStatus}>
                      <span className={`${styles.statusBadge} ${styles.activo}`}>Activo</span>
                    </div>
                  </div>
                  
                  <div className={styles.cardBody}>
                    <div className={styles.cardItem}>
                      <span className={styles.itemLabel}>Identificación:</span>
                      <span className={styles.itemValue}>{persona.identificacion}</span>
                    </div>
                    <div className={styles.cardItem}>
                      <span className={styles.itemLabel}>Teléfono:</span>
                      <span className={styles.itemValue}>{persona.telefono}</span>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <button onClick={() => openDetalle(persona.id)} className={styles.btnView}>
                      Detalles
                    </button>
                    <div className={styles.actionGroup}>
                      <Link href={`/personas/${persona.id}/editar`} className={styles.btnEdit}>
                        <Edit size={18} />
                      </Link>
                      <button 
                        onClick={() => handleDelete(persona.id, persona.nombre_completo)}
                        className={styles.btnDelete}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Modal de Detalle */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Detalle del Perfil"
        size="lg"
      >
        {selectedPersonaId && (
          <PersonaDetalleView id={selectedPersonaId} isModal={true} />
        )}
      </Modal>
    </div>
  )
}
