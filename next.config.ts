import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Configurações para evitar bloqueio do Firestore
  async headers() {
    return [
      {
        // Rotas do Firebase
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
