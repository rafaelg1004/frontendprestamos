"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Shield, Trash2, Mail, Calendar, LogIn, AlertTriangle } from "lucide-react";
import { authApi } from "@/lib/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import toast from "react-hot-toast";

import { CrearAdminModal } from "./CrearAdminModal";

export default function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await authApi.getAdmins();
      setAdmins(res.data.data || []);
    } catch (err) {
      setError("Error al cargar los administradores");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDelete = async (id, email) => {
    if (confirm(`¿Estás seguro de que deseas eliminar al administrador ${email}? Esta acción no se puede deshacer.`)) {
      try {
        await authApi.deleteAdmin(id);
        toast.success("Administrador eliminado correctamente");
        fetchAdmins();
      } catch (err) {
        toast.error(err.response?.data?.message || "Error al eliminar administrador");
      }
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={24} color="#4f46e5" />
            Administradores del Sistema
          </h1>
          <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>Gestiona quién tiene acceso de control total a la plataforma</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
            backgroundColor: '#4f46e5', color: 'white', padding: '0.5rem 1rem', 
            borderRadius: '0.375rem', border: 'none', fontWeight: '500', cursor: 'pointer'
          }}
        >
          <Plus size={20} />
          Nuevo Administrador
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Cargando administradores...</div>
        ) : admins.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>No se encontraron administradores.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>Email</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>Rol</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>Fecha de Creación</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem' }}>Último Acceso</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: '500', color: '#374151', fontSize: '0.875rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#111827', fontWeight: '500' }}>
                    <Mail size={16} color="#6b7280" />
                    {admin.email}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ backgroundColor: '#e0e7ff', color: '#4338ca', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '500' }}>
                      {admin.rol.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} />
                      {format(new Date(admin.created_at), "dd MMM yyyy", { locale: es })}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <LogIn size={14} />
                      {admin.last_sign_in_at ? format(new Date(admin.last_sign_in_at), "dd MMM yyyy HH:mm", { locale: es }) : 'Nunca'}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDelete(admin.id, admin.email)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', borderRadius: '0.375rem' }}
                      title="Eliminar Administrador"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CrearAdminModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreated={() => fetchAdmins()} 
      />
    </div>
  );
}
