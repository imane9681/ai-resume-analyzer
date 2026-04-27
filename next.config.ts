import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  serverExternalPackages: ['pdf-parse'],
  
  // تكوين Turbopack للتعامل مع pdf-parse
  turbopack: {
    resolveAlias: {
      'pdf-parse': 'pdf-parse/lib/pdf-parse.js',
    },
  },
};

export default nextConfig;