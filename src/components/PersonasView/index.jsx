'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { perfilesApi } from '@/lib/api'
import { Users, Plus, Search, User, TrendingUp, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './PersonasView.module.css'

export function PersonasView() {
  const [personas, setPersonas] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroRol, setFiltroRol] = useState('') // '' = todos, 'cliente', 'inversionista'
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    fetchPersonas()
  }, [filtroRol])

  const fetchPersonas = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filtroRol) params.rol = filtroRol
      
      const response = await perfilesApi.getAll(params)
      setPersonas(response.data?.data || [])
    } catch (error) {
      toast.error('Error al cargar personas')
    } finally {
      setLoading(false)
    }
  }

  const personasFiltradas = personas.filter(p => 
    p.nombre_completo?.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.email?.toLowerCase().includes(busqueda.toLowerCase())
  )

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
            placeholder="Buscar por nombre o email..."
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
      ) : personasFiltradas.length === 0 ? (
        <div className={styles.empty}>
          <Users size={48} />
          <p>No hay personas registradas</p>
          <Link href="/personas/nueva" className={styles.btnSecondary}>
            Crear primera persona
          </Link>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {personasFiltradas.map((persona) => (
                <tr key={persona.id}>
                  <td>
                    <div className={styles.personaInfo}>
                      <div className={styles.avatar}>
                        {persona.nombre_completo?.charAt(0).toUpperCase()}
                      </div>
                      <span className={styles.nombre}>{persona.nombre_completo}</span>
                    </div>
                  </td>
                  <td>{persona.email}</td>
                  <td>{persona.telefono || '-'}</td>
                  <td>
                    <span className={`${styles.rol} ${styles[persona.rol]}`}>
                      {persona.rol === 'cliente' ? 'Cliente' : 'Inversionista'}
                    </span>
                  </td>
                  <td>
                    <Link href={`/personas/${persona.id}`} className={styles.btnView}>
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
  )
}
