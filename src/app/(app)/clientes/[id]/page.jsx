import { ClienteDetalleView } from "@/components/ClienteDetalleView";

export default async function ClienteDetallePage({ params }) {
  const { id } = await params;
  return <ClienteDetalleView id={id} />;
}
