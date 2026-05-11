'use client'

import { PersonaForm } from '@/components/PersonaForm'
import { useParams } from 'next/navigation'

export default function EditarPersonaPage() {
  const params = useParams()
  const id = params.id

  return <PersonaForm id={id} />
}
