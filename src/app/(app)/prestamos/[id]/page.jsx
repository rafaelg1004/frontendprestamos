import { PrestamoDetalleView } from "@/components/PrestamoDetalleView";

export default async function PrestamoDetallePage({ params }) {
  const { id } = await params;
  return <PrestamoDetalleView id={id} />;
}
