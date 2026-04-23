"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { prestamosApi } from "@/lib/api";
import { RegistroPagoForm } from "@/components/RegistroPagoForm";

export default function PagoPrestamoPage() {
  const params = useParams();
  const [prestamo, setPrestamo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrestamo = async () => {
      try {
        const response = await prestamosApi.getById(params.id);
        setPrestamo(response.data?.data);
      } catch (error) {
        console.error("Error fetching prestamo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPrestamo();
  }, [params.id]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!prestamo) {
    return <div>Préstamo no encontrado</div>;
  }

  return (
    <RegistroPagoForm
      prestamoId={params.id}
      clienteId={prestamo.cliente_id || prestamo.cliente?.id}
      tipo="prestamo"
    />
  );
}
