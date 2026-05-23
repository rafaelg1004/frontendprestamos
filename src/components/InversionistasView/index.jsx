'use client'

import { useEffect, useState } from 'react'
import { perfilesApi } from '@/lib/api'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import styles from './InversionistasView.module.css'

export function InversionistasView() {
  const [inversionistas, setInversionistas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchInversionistas = async () => {
      try {
        const { data } = await perfilesApi.getAll({ rol: 'inversionista', limit: 1000 })
        setInversionistas(data.data || [])
      } catch (error) {
        console.error('Error fetching inversionistas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInversionistas()
  }, [])

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <div className={styles.loadingSkeleton} style={{ width: '200px' }}></div>
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
          <h1>Inversionistas</h1>
          <p className={styles.subtitle}>Gestiona tus inversionistas</p>
        </div>
        <Link href="/inversionistas/nuevo" className={styles.btnPrimary}>
          <Plus size={20} />
          Nuevo Inversionista
        </Link>
      </div>

      <div className={styles.card}>
        {inversionistas.length === 0 ? (
          <p className={styles.emptyState}>No hay inversionistas registrados</p>
        ) : (
          <div>
            <p style={{ marginBottom: "1rem" }}>Total: {inversionistas.length} inversionistas</p>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Saldo en Billetera (Intereses Generados)</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {inversionistas.map(inv => (
                    <tr key={inv.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className={styles.avatar}>
                            {inv.nombre_completo.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 500 }}>{inv.nombre_completo}</span>
                        </div>
                      </td>
                      <td>{inv.email || "-"}</td>
                      <td>{inv.telefono || "-"}</td>
                      <td>
                        <span style={{ color: "#16a34a", fontWeight: "bold" }}>
                          $ {Number(inv.billetera_saldo || 0).toLocaleString("es-CO")}
                        </span>
                      </td>
                      <td>
                        <Link href={`/inversionistas/${inv.id}`} className={styles.btnAction}>
                          Ver Detalles
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
