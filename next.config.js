/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Deshabilitar redirección automática de trailing slash
  skipTrailingSlashRedirect: true,
  // Configurar rewrites para proxy al backend
  async rewrites() {
    // En producción (Coolify), usar la URL del backend
    // En desarrollo, usar localhost:3005
    let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3005";

    // Asegurar que la URL tenga protocolo
    if (
      apiUrl &&
      !apiUrl.startsWith("http://") &&
      !apiUrl.startsWith("https://")
    ) {
      apiUrl = "https://" + apiUrl;
    }

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
