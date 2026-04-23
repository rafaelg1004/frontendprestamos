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
        const { data } = await perfilesApi.getAll({ rol: 'inversionista' })
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
            <p>Total: {inversionistas.length} inversionistas</p>
            {/* Aquí va la tabla de inversionistas */}
          </div>
        )}
      </div>
    </div>
  )
}
