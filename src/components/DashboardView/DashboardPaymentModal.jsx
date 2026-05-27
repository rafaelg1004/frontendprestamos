import React, { useEffect } from "react";
import { PagoLibreModal } from "@/components/PrestamoDetalleView/PagoLibreModal";
import { usePrestamoDetalle } from "@/hooks/prestamos/usePrestamoDetalle";

export function DashboardPaymentModal({ prestamoId, isOpen, onClose }) {
  const {
    prestamo,
    loading,
    cuentas,
    showPagoLibreModal,
    setShowPagoLibreModal,
    pagoLibreData,
    setPagoLibreData,
    distribucionCapital,
    setDistribucionCapital,
    distribucionIntereses,
    setDistribucionIntereses,
    handleOpenPagoModal,
    handlePagarLibreSubmit,
    uploading
  } = usePrestamoDetalle(prestamoId);

  // Cuando el préstamo termine de cargar y el prop isOpen sea true, abrimos el modal interno
  useEffect(() => {
    if (isOpen && !loading && prestamo) {
      handleOpenPagoModal();
    }
  }, [isOpen, loading, prestamo]);

  // Si se cierra el modal desde el dashboard, reiniciamos el modal interno
  useEffect(() => {
    if (!isOpen) {
      setShowPagoLibreModal(false);
    }
  }, [isOpen]);

  if (!isOpen || loading || !prestamo) return null;

  return (
    <PagoLibreModal
      isOpen={showPagoLibreModal}
      onClose={() => {
        setShowPagoLibreModal(false);
        onClose();
      }}
      prestamo={prestamo}
      calculos={prestamo?.calculos}
      pagoLibreData={pagoLibreData}
      setPagoLibreData={setPagoLibreData}
      distribucionCapital={distribucionCapital}
      setDistribucionCapital={setDistribucionCapital}
      distribucionIntereses={distribucionIntereses}
      setDistribucionIntereses={setDistribucionIntereses}
      onSubmit={async (e) => {
        await handlePagarLibreSubmit(e);
        onClose(); // Cerrar el wrapper después de pagar
      }}
      cuentas={cuentas}
      uploading={uploading}
    />
  );
}
