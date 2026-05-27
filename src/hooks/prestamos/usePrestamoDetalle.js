import { useState, useEffect } from "react";
import { prestamosApi, perfilesApi, cuentasApi } from "@/lib/api";
import toast from "react-hot-toast";

export function usePrestamoDetalle(id) {
  const [prestamo, setPrestamo] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [documentos, setDocumentos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [cuentas, setCuentas] = useState([]);

  // Modal State
  const [showPagoLibreModal, setShowPagoLibreModal] = useState(false);
  const [pagoLibreData, setPagoLibreData] = useState({ 
    cuenta_id: "", 
    cuenta_intereses_id: "", 
    metodo_pago: "efectivo", 
    monto_capital: "",
    monto_interes: "",
    condonar_intereses: false,
    notas: "" 
  });
  const [distribucionCapital, setDistribucionCapital] = useState([]);
  const [distribucionIntereses, setDistribucionIntereses] = useState([]);
  const [archivoPagoLibre, setArchivoPagoLibre] = useState(null);
  
  // Estados para eliminación de documentos
  const [docToDelete, setDocToDelete] = useState(null);
  const [deletingDoc, setDeletingDoc] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const prestamoRes = await prestamosApi.getById(id);
        const prestamoData = prestamoRes.data?.data;
        setPrestamo(prestamoData);

        const clientId = prestamoData?.cliente_id || prestamoData?.cliente?.id;
        if (clientId) {
          const clienteRes = await perfilesApi.getById(clientId);
          setCliente(clienteRes.data?.data);
        }
      } catch (error) {
        console.error("Error fetching prestamo:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchDocumentos = async () => {
      try {
        const res = await prestamosApi.getDocumentos(id);
        setDocumentos(res.data?.data || []);
      } catch (error) {
        console.error("Error fetching documentos:", error);
      }
    };

    const fetchCuentas = async () => {
      try {
        const res = await cuentasApi.getAll();
        setCuentas(res.data?.data || []);
      } catch (error) {}
    };

    fetchData();
    fetchDocumentos();
    fetchCuentas();
  }, [id]);

  const handleOpenPagoModal = () => {
    setPagoLibreData({
      cuenta_id: prestamo.cuenta_id || (cuentas.length > 0 ? cuentas[0].id : ""),
      cuenta_intereses_id: prestamo.cuenta_id || (cuentas.length > 0 ? cuentas[0].id : ""),
      metodo_pago: "efectivo",
      monto_capital: "",
      monto_interes: "",
      condonar_intereses: false,
      metodo_pago: 'transferencia',
      notas: `Abono a crédito rotativo`
    });

    setDistribucionCapital([]);
    setDistribucionIntereses([]);
    setArchivoPagoLibre(null);

    setShowPagoLibreModal(true);
  };

  const handlePagarLibreSubmit = async (e) => {
    e.preventDefault();

    try {
      setUploading(true);
      const dataToSubmit = {
        ...pagoLibreData,
        monto_capital: (parseFloat(pagoLibreData.monto_capital) || 0) * 1000,
        monto_interes: (parseFloat(pagoLibreData.monto_interes) || 0) * 1000,
        condonar_intereses: pagoLibreData.condonar_intereses,
        distribucion_capital: distribucionCapital.map(d => ({ inversion_id: d.inversion_id, monto: parseFloat(d.monto || 0) * 1000 })),
        distribucion_intereses: distribucionIntereses.map(d => ({ inversion_id: d.inversion_id, monto: parseFloat(d.monto || 0) * 1000 }))
      };
      
      let finalData = dataToSubmit;
      if (archivoPagoLibre && pagoLibreData.metodo_pago === 'transferencia') {
        const formData = new FormData();
        Object.keys(dataToSubmit).forEach(key => {
          if (Array.isArray(dataToSubmit[key])) {
            formData.append(key, JSON.stringify(dataToSubmit[key]));
          } else {
            formData.append(key, dataToSubmit[key]);
          }
        });
        formData.append('captura', archivoPagoLibre);
        finalData = formData;
      }
      
      await prestamosApi.registrarPagoLibre(id, finalData);
      toast.success(`Pago registrado exitosamente`);
      
      setShowPagoLibreModal(false);
      
      const prestamoRes = await prestamosApi.getById(id);
      setPrestamo(prestamoRes.data?.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al registrar el pago");
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("archivo", file);
    formData.append("tipo_documento", "otro");

    try {
      setUploading(true);
      await prestamosApi.subirDocumento(id, formData);
      toast.success("Documento subido correctamente");
      const res = await prestamosApi.getDocumentos(id);
      setDocumentos(res.data?.data || []);
    } catch (error) {
      toast.error("Error al subir el documento");
      console.error(error);
    } finally {
      setUploading(false);
      e.target.value = null;
    }
  };

  const handleViewDocument = async (docId) => {
    try {
      const loadingToast = toast.loading("Abriendo documento...");
      const res = await prestamosApi.getDocumentViewToken(docId);
      toast.dismiss(loadingToast);
      if (res.data?.success && res.data?.token) {
        const url = `/api/uploads/documentos/${res.data.ruta_archivo}?view_token=${res.data.token}`;
        window.open(url, '_blank');
      }
    } catch (error) {
      toast.error("Error al obtener acceso al documento");
      console.error(error);
    }
  };

  const handleDeleteDocumento = async () => {
    if (!docToDelete) return;

    setDeletingDoc(true);
    try {
      await prestamosApi.eliminarDocumento(docToDelete.id);
      toast.success("Documento eliminado correctamente");
      setDocumentos(documentos.filter(d => d.id !== docToDelete.id));
      setDocToDelete(null);
    } catch (error) {
      toast.error("Error al eliminar el documento");
      console.error("Error eliminando documento:", error);
    } finally {
      setDeletingDoc(false);
    }
  };

  return {
    prestamo,
    cliente,
    loading,
    documentos,
    uploading,
    cuentas,
    showPagoLibreModal,
    setShowPagoLibreModal,
    pagoLibreData,
    setPagoLibreData,
    archivoPagoLibre,
    setArchivoPagoLibre,
    distribucionCapital,
    setDistribucionCapital,
    distribucionIntereses,
    setDistribucionIntereses,
    handleOpenPagoModal,
    handlePagarLibreSubmit,
    handleFileUpload,
    handleViewDocument,
    handleDeleteDocumento,
    docToDelete,
    setDocToDelete,
    deletingDoc
  };
}
