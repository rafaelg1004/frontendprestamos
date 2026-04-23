import { InversionDetalleView } from "@/components/InversionDetalleView";

export default async function InversionDetallePage({ params }) {
  const { id } = await params;
  return <InversionDetalleView id={id} />;
}
