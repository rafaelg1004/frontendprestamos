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
  if (parts.length === 2) return parts.pop().split(";").shift();
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

// Interceptor de respuesta para manejar token expirado
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      deleteCookie("auth_token");
      if (typeof window !== "undefined") {
        // Redirigir al login con mensaje de sesión expirada
        window.location.href = "/login?expired=true";
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
  getMovimientosRecientes: (limit = 10) =>
    api.get(`/dashboard/movimientos/recientes?limit=${limit}`),
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
  create: (data) => api.post("/prestamos", data),
  update: (id, data) => api.put(`/prestamos/${id}`, data),
  delete: (id) => api.delete(`/prestamos/${id}`),
  pagar: (id, data) => api.post(`/prestamos/${id}/pagar`, data),
  getMora: () => api.get("/prestamos/mora/listado"),
  calcularLiquidacion: (id) => api.get(`/prestamos/${id}/liquidacion`),
};

// Inversiones
export const inversionesApi = {
  getAll: (params = {}) => api.get("/inversiones", { params }),
  getById: (id) => api.get(`/inversiones/${id}`),
  create: (data) => api.post("/inversiones", data),
  update: (id, data) => api.put(`/inversiones/${id}`, data),
  delete: (id) => api.delete(`/inversiones/${id}`),
  devolver: (id, data) => api.post(`/inversiones/${id}/devolver`, data),
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
  login: (identificacion, password) =>
    api.post("/auth/login", { identificacion, password }),
  register: (identificacion, password) =>
    api.post("/auth/register", { identificacion, password }),
  logout: () => {
    deleteCookie("auth_token");
    return Promise.resolve();
  },
  setToken: (token) => {
    setCookie("auth_token", token, 7); // 7 días
  },
};
