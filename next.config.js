/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Modo standalone para Docker/Coolify
  output: "standalone",
  // Deshabilitar redirección automática de trailing slash
  skipTrailingSlashRedirect: true,
  // Configurar rewrites para proxy al backend
  async rewrites() {
    // En producción (Coolify), usar la URL del backend
    // En desarrollo, usar localhost:3005
    const isProd = process.env.NODE_ENV === "production";
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      (isProd
        ? "https://backendprestamos.binaria.online"
        : "http://localhost:3005");

    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  // Configuración de imágenes (si usas next/image con dominios externos)
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
