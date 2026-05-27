"use client";

import { useState, useEffect } from "react";
import { Shield, AlertCircle } from "lucide-react";
import { authApi } from "@/lib/api";
import { Modal } from "@/components/Modal";
import toast from "react-hot-toast";

const AVAILABLE_PERMISSIONS = [
  { id: 'ver_reportes', label: 'Ver Reportes / Dashboard' },
  { id: 'ver_personas', label: 'Ver Personas' },
  { id: 'ver_prestamos', label: 'Ver Préstamos' },
  { id: 'crear_prestamos', label: 'Crear Préstamos' },
  { id: 'registrar_pagos', label: 'Registrar Pagos' },
  { id: 'ver_inversiones', label: 'Ver Inversiones' },
  { id: 'gestionar_inversiones', label: 'Gestionar Inversiones' },
  { id: 'gestionar_caja', label: 'Gestionar Caja/Movimientos' },
  { id: 'gestionar_usuarios', label: 'Gestionar Usuarios' },
];

export function EditarPermisosModal({ isOpen, onClose, onUpdated, admin }) {
  const [permisos, setPermisos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (admin && admin.permisos) {
      setPermisos(admin.permisos);
    } else {
      setPermisos([]);
    }
  }, [admin, isOpen]);

  const togglePermiso = (id) => {
    setPermisos(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authApi.updatePermisos(admin.id, permisos);
      toast.success("Permisos actualizados exitosamente");
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Error al actualizar permisos");
      toast.error("Error al actualizar permisos");
    } finally {
      setLoading(false);
    }
  };

  if (!admin) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Editar Permisos: ${admin.email}`}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fef2f2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <div style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          <Shield size={20} />
          <span>Selecciona las áreas de la plataforma a las que este usuario tendrá acceso.</span>
        </div>

        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.375rem', border: '1px solid #d1d5db' }}>
            {AVAILABLE_PERMISSIONS.map(perm => (
              <label key={perm.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#4b5563', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={permisos.includes(perm.id)}
                  onChange={() => togglePermiso(perm.id)}
                  style={{ accentColor: '#4f46e5', width: '1rem', height: '1rem' }}
                />
                {perm.label}
              </label>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ flex: 1, padding: '0.75rem', border: '1px solid #d1d5db', backgroundColor: 'white', color: '#374151', borderRadius: '0.375rem', fontWeight: '500', cursor: 'pointer' }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ flex: 1, padding: '0.75rem', border: 'none', backgroundColor: '#4f46e5', color: 'white', borderRadius: '0.375rem', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Guardando..." : "Guardar Permisos"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
