import { useState } from "react";
import { UserPlus, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { authApi } from "@/lib/api";
import { Modal } from "@/components/Modal";
import toast from "react-hot-toast";

export function CrearAdminModal({ isOpen, onClose, onCreated }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      await authApi.createAdmin(email, password, nombre);
      toast.success("Usuario administrativo creado exitosamente");
      // Reset form
      setEmail("");
      setPassword("");
      setNombre("");
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Error al crear usuario");
      toast.error("Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo Administrador">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fef2f2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Nombre</label>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', backgroundColor: '#f9fafb' }}>
            <UserPlus size={20} color="#9ca3af" style={{ marginRight: '0.5rem' }} />
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre completo"
              required
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Email</label>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', backgroundColor: '#f9fafb' }}>
            <Mail size={20} color="#9ca3af" style={{ marginRight: '0.5rem' }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ejemplo.com"
              required
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>Contraseña</label>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '0.375rem', padding: '0.5rem 0.75rem', backgroundColor: '#f9fafb' }}>
            <Lock size={20} color="#9ca3af" style={{ marginRight: '0.5rem' }} />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.875rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#9ca3af' }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
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
            {loading ? "Creando..." : "Crear Administrador"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
