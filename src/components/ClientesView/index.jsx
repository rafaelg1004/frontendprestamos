'use client'

import { useEffect, useState } from 'react'
import { perfilesApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Plus, Search, Phone, Mail } from 'lucide-react'
import Link from 'next/link'
import styles from './ClientesView.module.css'

export function ClientesView() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const { data } = await perfilesApi.getAll({ rol: 'cliente' })
        setClientes(data.data || [])
      } catch (error) {
        console.error('Error fetching clientes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchClientes()
  }, [])

  const filteredClientes = clientes.filter(c => 
    c.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <div className={styles.skeletonRow} style={{ width: '200px', height: '2rem' }}></div>
          </div>
        </div>
        <div className={styles.card}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={styles.skeletonRow}></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Clientes</h1>
          <p className={styles.subtitle}>Gestiona tus clientes y sus préstamos</p>
        </div>
        <Link href="/clientes/nuevo" className={styles.btnPrimary}>
          <Plus size={20} />
          Nuevo Cliente
        </Link>
      </div>

      <div className={styles.card}>
        <div className={styles.toolbar}>
          <div className={styles.searchBox}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.input}
            />
          </div>
          <span className={styles.count}>{filteredClientes.length} clientes</span>
        </div>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Contacto</th>
                <th>Fecha Registro</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan={4} className={styles.emptyState}>
                    No se encontraron clientes
                  </td>
                </tr>
              ) : (
                filteredClientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>
                      <div className={styles.clientCell}>
                        <div className={styles.avatar}>
                          {cliente.nombre_completo?.charAt(0).toUpperCase()}
                        </div>
                        <span className={styles.clientName}>{cliente.nombre_completo}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.contactCell}>
                        <div className={styles.contactItem}>
                          <Mail className={styles.contactIcon} size={16} />
                          {cliente.email}
                        </div>
                        {cliente.telefono && (
                          <div className={styles.contactItem}>
                            <Phone className={styles.contactIcon} size={16} />
                            {cliente.telefono}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={styles.dateCell}>
                      {formatDate(cliente.fecha_registro)}
                    </td>
                    <td className={styles.actionsCell}>
                      <Link href={`/clientes/${cliente.id}`} className={styles.link}>
                        Ver detalle →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
