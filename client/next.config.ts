import type { NextConfig } from "next";

const nextConfig: any = {
  /* config options here */
  allowedDevOrigins: ['192.168.100.4'],
  experimental: {
    turbopack: {
      root: './',
    },
  },
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
