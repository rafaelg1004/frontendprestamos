import { CuentaDetalleView } from '@/components/CuentaDetalleView'

export default async function CuentaDetallePage({ params }) {
  const { id } = await params;
  return <CuentaDetalleView id={id} />
}
