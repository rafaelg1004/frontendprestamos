import { PersonaDetalleView } from "@/components/PersonaDetalleView";

export default async function PersonaDetallePage({ params }) {
  const { id } = await params;
  return <PersonaDetalleView id={id} />;
}
