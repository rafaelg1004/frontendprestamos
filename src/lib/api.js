import axios from "axios";

// Usar ruta relativa para que el proxy de Next.js maneje la petición
// Así las cookies se envían correctamente (mismo origen)
const API_URL = "/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Función para obtener cookie por nombre
function getCookie(name) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length >= 2) return parts.pop().split(";").shift();
  return null;
}

// Interceptor para agregar el token de autenticación desde cookies
api.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    const token = getCookie("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor de respuesta para manejar token expirado y permisos
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";
    const is401 = error.response?.status === 401;
    const is403 = error.response?.status === 403;
    // Solo redirigir al login si el 401 NO viene de /auth/me
    // (ese endpoint se usa para cargar el sidebar y no debería expulsar al usuario)
    const isAuthMeCheck = requestUrl.includes("/auth/me");
    
    if (is401 && !isAuthMeCheck) {
      deleteCookie("auth_token");
      if (typeof window !== "undefined") {
        window.location.href = "/?expired=true";
      }
    } else if (is403) {
      // Redirigir al dashboard principal si el usuario no tiene permisos
      if (typeof window !== "undefined" && window.location.pathname !== "/dashboard") {
        window.location.href = "/dashboard";
      }
    }
    return Promise.reject(error);
  },
);

export default api;

// Dashboard
export const dashboardApi = {
  getResumen: () => api.get("/dashboard/resumen"),
  getClientesDetalle: (params = {}) =>
    api.get("/dashboard/clientes/detalle", { params }),
  getInversionistasDetalle: (params = {}) =>
    api.get("/dashboard/inversionistas/detalle", { params }),
  getAlertasVencimientos: () => api.get("/dashboard/alertas/vencimientos"),
  getAlertasInversionistas: () => api.get("/dashboard/alertas/inversionistas"),
  getMovimientosRecientes: (limit = 10) =>
    api.get(`/dashboard/movimientos/recientes?limit=${limit}`),
  getFlujoCajaHistorico: () => api.get("/dashboard/flujo-caja-historico"),
};

// Perfiles
export const perfilesApi = {
  getAll: (params = {}) => api.get("/perfiles", { params }),
  getById: (id) => api.get(`/perfiles/${id}`),
  create: (data) => api.post("/perfiles", data),
  update: (id, data) => api.put(`/perfiles/${id}`, data),
  delete: (id) => api.delete(`/perfiles/${id}`),
  getResumen: (id) => api.get(`/perfiles/${id}/resumen`),
};

// Préstamos
export const prestamosApi = {
  getAll: (params = {}) => api.get("/prestamos", { params }),
  getById: (id) => api.get(`/prestamos/${id}`),
  getPublicByCedula: (cedula) => api.get(`/prestamos/publico/cedula/${cedula}`),
  create: (data) => api.post("/prestamos", data),
  update: (id, data) => api.put(`/prestamos/${id}`, data),
  delete: (id) => api.delete(`/prestamos/${id}`),
  pagar: (id, data) => api.post(`/prestamos/${id}/pagar`, data),
  getMora: () => api.get("/prestamos/mora/listado"),
  calcularLiquidacion: (id) => api.get(`/prestamos/${id}/liquidacion`),
  getFiltros: () => api.get("/prestamos/filtros"),
  // Documentos

  getDocumentos: (id) => api.get(`/prestamos/${id}/documentos`),
  subirDocumento: (id, formData) => api.post(`/prestamos/${id}/documentos`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  eliminarDocumento: (docId) => api.delete(`/prestamos/documentos/${docId}`),
  getDocumentViewToken: (docId) => api.get(`/prestamos/documentos/${docId}/view-token`),
  registrarPagoLibre: (id, data) => {
    const config = data instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } } 
      : {};
    return api.post(`/prestamos/${id}/pagos`, data, config);
  },
};

// Inversiones
export const inversionesApi = {
  getAll: (params = {}) => api.get("/inversiones", { params }),
  getPublicByCedula: (cedula) => api.get(`/inversiones/publico/cedula/${cedula}`),
  getById: (id) => api.get(`/inversiones/${id}`),
  create: (data) => api.post("/inversiones", data),
  update: (id, data) => api.put(`/inversiones/${id}`, data),
  delete: (id) => api.delete(`/inversiones/${id}`),
  pagar: (id, data) => {
    const config = data instanceof FormData 
      ? { headers: { 'Content-Type': 'multipart/form-data' } } 
      : {};
    return api.post(`/inversiones/${id}/pagar`, data, config);
  },
  registrarInteresHistorico: (id, data) => api.post(`/inversiones/${id}/interes-historico`, data),
};


// Cuentas
export const cuentasApi = {
  getAll: (params = {}) => api.get("/cuentas", { params }),
  getById: (id) => api.get(`/cuentas/${id}`),
  create: (data) => api.post("/cuentas", data),
  update: (id, data) => api.put(`/cuentas/${id}`, data),
  delete: (id) => api.delete(`/cuentas/${id}`),
  sincronizar: (id) => api.post(`/cuentas/${id}/sincronizar`),
};


// Reportes
export const reportesApi = {
  getRentabilidad: () => api.get("/reportes/rentabilidad"),
  getCartera: () => api.get("/reportes/cartera"),
};

// Movimientos
export const movimientosApi = {
  getAll: (params = {}) => api.get("/movimientos", { params }),
  getById: (id) => api.get(`/movimientos/${id}`),
  create: (data) => api.post("/movimientos", data),
  update: (id, data) => api.put(`/movimientos/${id}`, data),
  delete: (id) => api.delete(`/movimientos/${id}`),
  getResumenFlujoCaja: (params = {}) =>
    api.get("/movimientos/resumen/flujo-caja", { params }),
};

// Función para establecer cookie
function setCookie(name, value, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const isSecure = window.location.protocol === "https:";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${isSecure ? "; Secure" : ""}`;
}

// Función para eliminar cookie
function deleteCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// Auth - Cookies en lugar de localStorage
export const authApi = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (identificacion, password) =>
    api.post("/auth/register", { identificacion, password }),
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Error logging out from server", e);
    } finally {
      deleteCookie("auth_token");
    }
  },
  setToken: (token) => {
    setCookie("auth_token", token, 7); // 7 días
  },
  me: () => api.get("/auth/me"),
  changePassword: (currentPassword, newPassword) =>
    api.put("/auth/change-password", { currentPassword, newPassword }),
  createAdmin: (email, password, nombre, permisos) =>
    api.post("/auth/create-admin", { email, password, nombre, permisos }),
  getAdmins: () => api.get("/auth/admins"),
  deleteAdmin: (id) => api.delete(`/auth/admins/${id}`),
  updatePermisos: (id, permisos) => api.put(`/auth/admins/${id}/permisos`, { permisos })
};
