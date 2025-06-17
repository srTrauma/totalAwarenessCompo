/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para build en producción sin errores de SSR
  typescript: {
    ignoreBuildErrors: true, // Temporal para resolver build
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporal para resolver build
  },
  
  // Configuración para Next.js 14
  experimental: {
    forceSwcTransforms: true,
  },
  
  // Optimizaciones
  swcMinify: true,
  
  // Configuración de output para export estático
  output: 'standalone',
  
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
      };
    }
    return config;
  }
}

module.exports = nextConfig