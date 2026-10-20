import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.10.30.41'],
  output: process.env.VERCEL ? undefined : "standalone",
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/package',
        destination: '/packages?category=ai-services',
        permanent: true,
      },
      {
        source: '/brief',
        destination: '/briefs',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    const mainApiUrl = (
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_SERVER_API_URL ||
      'http://localhost:8080/api/v1'
    ).trim().replace(/\/$/, '');

    const adminApiUrl = (
      process.env.NEXT_PUBLIC_ADMIN_API_URL ||
      process.env.NEXT_PUBLIC_ADMIN_BACKEND_URL ||
      'http://localhost:8082/api/v1/admin'
    ).trim().replace(/\/$/, '');

    let mainPath = '/api/v1';
    try {
      mainPath = new URL(mainApiUrl).pathname.replace(/\/$/, '') || '/api/v1';
    } catch {}

    let adminPath = '/api/v1/admin';
    try {
      adminPath = new URL(adminApiUrl).pathname.replace(/\/$/, '') || '/api/v1/admin';
    } catch {}

    const rules = [
      { source: `${mainPath}/support/:path*`, destination: `${mainApiUrl}/support/:path*` },
      { source: '/api/support/:path*', destination: `${mainApiUrl}/support/:path*` },
      { source: `${mainPath}/storage/:path*`, destination: `${mainApiUrl}/storage/:path*` },
      { source: '/api/storage/:path*', destination: `${mainApiUrl}/storage/:path*` },
      { source: `${adminPath}/:path*`, destination: `${adminApiUrl}/:path*` },
      { source: '/api/admin/:path*', destination: `${adminApiUrl}/:path*` },
      { source: `${mainPath}/:path*`, destination: `${mainApiUrl}/:path*` },
      { source: '/api/:path*', destination: `${mainApiUrl}/:path*` },
    ];

    const seen = new Set<string>();
    return rules.filter((r) => {
      if (seen.has(r.source)) return false;
      seen.add(r.source);
      return true;
    });
  },

};

export default nextConfig;
