"use client";

import { useEffect, useState } from "react";
import { prestamosApi, perfilesApi, cuentasApi } from "@/lib/api";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  User,
  Calendar,
  Percent,
  Clock,
  DollarSign,
  FileText,
  Upload,
  Trash2,
  ExternalLink,
  Plus
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { usePrestamoDetalle } from "@/hooks/prestamos/usePrestamoDetalle";
import { PagoLibreModal } from "./PagoLibreModal";
import { Modal } from "../Modal";
import styles from "./PrestamoDetalleView.module.css";

export function PrestamoDetalleView({ id, isModal = false }) {
  const {
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
    distribucionCapital,
    setDistribucionCapital,
    distribucionIntereses,
    setDistribucionIntereses,
    archivoPagoLibre,
    setArchivoPagoLibre,
    handleOpenPagoModal,
    handlePagarLibreSubmit,
    handleFileUpload,
    handleViewDocument,
    handleDeleteDocumento,
    docToDelete,
    setDocToDelete,
    deletingDoc
  } = usePrestamoDetalle(id);




  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div
            className={styles.loadingSkeleton}
            style={{ width: "200px", height: "2rem" }}
          ></div>
        </div>
      </div>
    );
  }

  if (!prestamo) {
    return (
      <div className={styles.container}>
        <p>Préstamo no encontrado</p>
        <Link href="/prestamos" className={styles.link}>
          ← Volver a préstamos
        </Link>
      </div>
    );
  }

  const getBadgeClass = (estado) => {
    switch (estado) {
      case "activo":
        return styles.badgeSuccess;
      case "pagado":
        return styles.badgeSuccess;
      case "mora":
        return styles.badgeDanger;
      default:
        return styles.badgeWarning;
    }
  };

  return (
    <div className={`${styles.container} ${isModal ? styles.modalMode : ""}`}>
      {/* Header - Ocultar si es modal */}
      {!isModal && (
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h1>Préstamo #{prestamo.id?.slice(0, 8)}</h1>
            <p className={styles.subtitle}>Detalle del préstamo</p>
          </div>
          <div className={styles.actions}>
            <Link href="/prestamos" className={styles.btnSecondary}>
              <ArrowLeft size={18} />
              Volver
            </Link>
            {prestamo.estado === "activo" && (
              <button
                onClick={() => handleOpenPagoModal()}
                className={styles.btnPrimary}
              >
                Registrar Pago
              </button>
            )}
          </div>
        </div>
      )}

      {/* Si es modal, mostrar una versión simplificada del header o botones de acción */}
      {isModal && (
        <div className={styles.modalActions}>
           {prestamo.estado === "activo" && (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button
                onClick={() => handleOpenPagoModal()}
                className={styles.btnPrimary}
              >
                Registrar Pago
              </button>
            </div>
          )}
        </div>
      )}

      {/* Info del Cliente - Primero */}
      <div className={styles.card} style={{ marginBottom: "1rem" }}>
        <div className={styles.cardHeader}>
          <h2 className={styles.sectionTitle}>Cliente</h2>
        </div>

        {cliente ? (
          <div>
            <div className={styles.clientHeader}>
              <div className={styles.clientAvatar}>
                {cliente.nombre_completo?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className={styles.clientName}>
                  {cliente.nombre_completo}
                </p>
                <Link
                  href={`/clientes/${cliente.id}`}
                  className={styles.link}
                  style={{ fontSize: "0.875rem" }}
                >
                  Ver perfil →
                </Link>
              </div>
            </div>

            {(() => {
              let nivelConfianza = "Evaluando...";
              let colorConfianza = "#64748b";
              let cancelados = 0;
              let historico = 0;

              if (cliente.prestamos) {
                const enMora = cliente.prestamos.some(p => p.estado === 'mora');
                cancelados = cliente.prestamos.filter(p => p.estado === 'pagado').length;
                historico = cliente.prestamos.reduce((sum, p) => sum + parseFloat(p.monto_principal || 0), 0);
                
                if (enMora) {
                  nivelConfianza = "Riesgoso";
                  colorConfianza = "#ef4444";
                } else if (cancelados > 0) {
                  nivelConfianza = "Excelente";
                  colorConfianza = "#10b981";
                } else if (cliente.prestamos.length > 0) {
                  nivelConfianza = "Regular";
                  colorConfianza = "#f59e0b";
                } else {
                  nivelConfianza = "Nuevo";
                }
              }

              return (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Score</span>
                    <span style={{ fontSize: '0.875rem', color: colorConfianza, fontWeight: 'bold' }}>
                      {nivelConfianza}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Préstamos Pagados</span>
                    <span style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: '500' }}>{cliente.prestamos ? cancelados : '...'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Capital Histórico</span>
                    <span style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: '500' }}>{cliente.prestamos ? formatCurrency(historico) : '...'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Identificación</span>
                    <span style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: '500' }}>{cliente.identificacion || 'No registrada'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Teléfono</span>
                    <span style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: '500' }}>{cliente.telefono || 'No registrado'}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dirección</span>
                    <span style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: '500' }}>{cliente.direccion || 'No registrada'}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <p className={styles.emptyState}>
            Información del cliente no disponible
          </p>
        )}

        {prestamo.notas && (
          <div className={styles.observacionesSection}>
            <h3 className={styles.observacionesTitle}>
              Observaciones
            </h3>
            <p className={styles.observacionesText} style={{ whiteSpace: 'pre-wrap' }}>
              {prestamo.notas}
            </p>
          </div>
        )}
      </div>

      {/* Info del Préstamo - Fila compacta (después del cliente) */}
      <div className={styles.infoBar}>
        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Monto</span>
          <span className={styles.infoBarValue}>
            {formatCurrency(prestamo.monto_principal)}
          </span>
        </div>
        <div className={styles.infoBarSeparator}></div>

        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Interés Total</span>
          <span className={styles.infoBarValue}>
            {formatCurrency(prestamo.calculos?.interes_total_deuda)}
          </span>
        </div>
        <div className={styles.infoBarSeparator}></div>

        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Capital Actual</span>
          <span className={styles.infoBarValue}>
            {formatCurrency(prestamo.calculos?.capital_pendiente)}
          </span>
        </div>
        <div className={styles.infoBarSeparator}></div>

        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Tasa</span>
          <span className={styles.infoBarValue}>
            {prestamo.tasa_interes_mensual}%
          </span>
        </div>
        <div className={styles.infoBarSeparator}></div>



        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Inicio</span>
          <span className={styles.infoBarValue}>
            {formatDate(prestamo.fecha_inicio)}
          </span>
        </div>
        <div className={styles.infoBarSeparator}></div>

        <div className={styles.infoBarItem}>
          <span className={styles.infoBarLabel}>Próximo Corte</span>
          <span className={styles.infoBarValue}>
            {prestamo.fecha_ultimo_corte || prestamo.fecha_inicio ? formatDate(
              new Date(
                new Date(prestamo.fecha_ultimo_corte || prestamo.fecha_inicio).getFullYear(),
                new Date(prestamo.fecha_ultimo_corte || prestamo.fecha_inicio).getMonth() + 1,
                new Date(prestamo.fecha_ultimo_corte || prestamo.fecha_inicio).getDate()
              ).toISOString()
            ) : "N/A"}
          </span>
        </div>
      </div>

      {/* Historial de Movimientos */}
      <div className={styles.card} style={{ marginTop: "1.5rem" }}>
        <div className={styles.cardHeader}>
          <h2 className={styles.sectionTitle}>Historial de Movimientos</h2>
        </div>

        {/* Entrega del préstamo */}
        <div className={styles.movementItem}>
          <div
            className={styles.movementIcon}
            style={{ background: "#dcfce7", color: "#16a34a" }}
          >
            <DollarSign size={20} />
          </div>
          <div className={styles.movementInfo}>
            <p className={styles.movementTitle}>Entrega de Préstamo</p>
            <p className={styles.movementDate}>
              {formatDate(prestamo.fecha_inicio)}
            </p>
          </div>
          <div className={styles.movementAmount}>
            <span style={{ color: "#dc2626" }}>
              -{formatCurrency(prestamo.monto_principal)}
            </span>
          </div>
        </div>

        {/* Pagos realizados */}
        {prestamo.movimientos &&
        prestamo.movimientos.filter((m) => m.tipo === "pago_cliente").length >
          0 ? (
          prestamo.movimientos
            .filter((m) => m.tipo === "pago_cliente")
            .map((mov, index) => (
              <div key={mov.id || index} className={styles.movementItem}>
                <div
                  className={styles.movementIcon}
                  style={{ background: "#dbeafe", color: "#2563eb" }}
                >
                  <DollarSign size={20} />
                </div>
                <div className={styles.movementInfo}>
                  <p className={styles.movementTitle}>Pago Recibido</p>
                  <p className={styles.movementDate}>
                    {formatDate(mov.fecha_operacion)}
                  </p>
                  {mov.notas && (
                    <p className={styles.movementNotes}>{mov.notas}</p>
                  )}
                </div>
                <div className={styles.movementAmount} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ color: "#16a34a" }}>
                    +{formatCurrency(mov.monto_total)}
                  </span>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#6b7280",
                      marginTop: "2px",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}
                  >
                    <span>Capital: {formatCurrency(mov.monto_capital || 0)}
                    {mov.monto_interes > 0 &&
                      ` | Interés: ${formatCurrency(mov.monto_interes)}`}</span>
                  </div>
                  {mov.url_captura && (
                    <a href={`/api/uploads/documentos/${mov.url_captura}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none', marginTop: '0.25rem' }}>
                      <FileText size={12} /> Ver captura
                    </a>
                  )}
                </div>
              </div>
            ))
        ) : (
          <div className={styles.emptyMovements}>
            <p style={{ color: "#6b7280", margin: 0 }}>
              No hay pagos registrados aún
            </p>
          </div>
        )}

        {/* Resumen de saldo */}
        <div className={styles.saldoResumen} style={{ marginTop: "1.5rem" }}>
          <div className={styles.saldoRow}>
            <span>Total Prestado (Inicial):</span>
            <span>{formatCurrency(prestamo.monto_principal)}</span>
          </div>
          <div className={styles.saldoRow}>
            <span>Días desde último corte:</span>
            <span>{prestamo.calculos?.dias_transcurridos || 0} días</span>
          </div>
          <div className={styles.saldoRow}>
            <span>Interés generado en el periodo:</span>
            <span>{formatCurrency(prestamo.calculos?.interes_generado_periodo || 0)}</span>
          </div>
          <div
            className={styles.saldoRow}
            style={{
              borderTop: "2px solid #e5e7eb",
              paddingTop: "0.5rem",
              marginTop: "0.5rem",
              fontWeight: 600,
            }}
          >
            <span>Deuda Total (Capital + Intereses):</span>
            <span style={{ color: "#dc2626" }}>
              {formatCurrency(
                (prestamo.calculos?.capital_pendiente || 0) + (prestamo.calculos?.interes_total_deuda || 0)
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Documentos y Respaldos */}
      <div className={styles.card} style={{ marginTop: "1.5rem" }}>
        <div className={styles.cardHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className={styles.sectionTitle}>Documentos y Respaldos</h2>
          <div className={styles.uploadBtnWrapper}>
            <input 
              type="file" 
              id="doc-upload" 
              style={{ display: 'none' }} 
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <label htmlFor="doc-upload" className={styles.btnSecondary} style={{ cursor: 'pointer', margin: 0 }}>
              <Plus size={18} />
              {uploading ? "Subiendo..." : "Añadir Documento"}
            </label>
          </div>
        </div>
        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem', marginBottom: '1rem' }}>
          Límite de tamaño: 10 MB (PDF, Imágenes, Word). Si tu PDF es muy grande, puedes comprimirlo en <a href="https://www.ilovepdf.com/es/comprimir_pdf" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6', textDecoration: 'underline' }}>iLovePDF</a>.
        </p>

        <div className={styles.docsGrid}>
          {documentos.length > 0 ? (
            documentos.map((doc) => (
              <div key={doc.id} className={styles.docItem}>
                <div className={styles.docIcon}>
                  <FileText size={24} />
                </div>
                <div className={styles.docInfo}>
                  <p className={styles.docName}>{doc.nombre_archivo}</p>
                  <p className={styles.docMeta}>
                    {formatDate(doc.fecha_subida)} • {doc.tipo_documento}
                  </p>
                </div>
                <div className={styles.docActions}>
                  <button 
                    onClick={() => handleViewDocument(doc.id)}
                    className={styles.docActionBtn}
                    title="Ver documento"
                  >
                    <ExternalLink size={18} />
                  </button>
                  <button 
                    onClick={() => setDocToDelete(doc)}
                    className={`${styles.docActionBtn} ${styles.deleteBtn}`}
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyDocs}>
              <Upload size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p>No hay documentos cargados (Letras, Pagarés, Cédula, etc.)</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal para Pagar Libre */}
      <PagoLibreModal
        isOpen={showPagoLibreModal}
        onClose={() => setShowPagoLibreModal(false)}
        prestamo={prestamo}
        pagoLibreData={pagoLibreData}
        setPagoLibreData={setPagoLibreData}
        archivoPagoLibre={archivoPagoLibre}
        setArchivoPagoLibre={setArchivoPagoLibre}
        distribucionCapital={distribucionCapital}
        setDistribucionCapital={setDistribucionCapital}
        distribucionIntereses={distribucionIntereses}
        setDistribucionIntereses={setDistribucionIntereses}
        cuentas={cuentas}
        uploading={uploading}
        onSubmit={handlePagarLibreSubmit}
      />

      {/* Modal de confirmación para eliminar documento */}
      <Modal 
        isOpen={!!docToDelete} 
        onClose={() => !deletingDoc && setDocToDelete(null)}
        title="Eliminar Documento"
        size="sm"
      >
        <div style={{ padding: '1rem 0' }}>
          <p style={{ color: '#374151', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            ¿Estás seguro de que deseas eliminar el documento <strong>{docToDelete?.nombre_archivo}</strong>?
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button 
              onClick={() => setDocToDelete(null)}
              disabled={deletingDoc}
              style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#374151', cursor: deletingDoc ? 'not-allowed' : 'pointer', fontWeight: 500 }}
            >
              Cancelar
            </button>
            <button 
              onClick={handleDeleteDocumento}
              disabled={deletingDoc}
              style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', backgroundColor: '#ef4444', color: 'white', cursor: deletingDoc ? 'not-allowed' : 'pointer', fontWeight: 500 }}
            >
              {deletingDoc ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
