'use client'

import { Suspense } from 'react'
import { PrestamosView } from '@/components/PrestamosView'

export default function PrestamosPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Cargando préstamos...</div>}>
      <PrestamosView />
    </Suspense>
  )
}
