"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { inversionesApi } from "@/lib/api";
import { RegistroPagoForm } from "@/components/RegistroPagoForm";

export default function DevolucionInversionPage() {
  const params = useParams();
  const [inversion, setInversion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInversion = async () => {
      try {
        const response = await inversionesApi.getById(params.id);
        setInversion(response.data?.data);
      } catch (error) {
        console.error("Error fetching inversion:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInversion();
  }, [params.id]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!inversion) {
    return <div>Inversión no encontrada</div>;
  }

  return (
    <RegistroPagoForm
      prestamoId={params.id}
      clienteId={inversion.inversionista_id || inversion.inversionista?.id}
      tipo="inversion"
    />
  );
}
