import { InversionistaDetalleView } from "@/components/InversionistaDetalleView";

export default async function InversionistaDetallePage({ params }) {
  const { id } = await params;
  return <InversionistaDetalleView id={id} />;
}
