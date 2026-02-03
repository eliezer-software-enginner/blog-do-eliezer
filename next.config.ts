import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Configurações de cache e headers
  async headers() {
    return [
      {
        // Cache para páginas estáticas (home, sitemap, robots)
        source: '/(sitemap\\.xml|robots\\.txt|_next/static/.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache para páginas de posts (ISR-friendly)
        source: '/post/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },

    ];
  },

  // Configurações de otimização
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },

  // Imagens otimizadas - desabilitado temporariamente
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'blog-do-eliezer.vercel.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'storage.googleapis.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    unoptimized: false,
  },

  // Configurações de revalidação
  generateEtags: true,
  poweredByHeader: false,
};

export default nextConfig;
