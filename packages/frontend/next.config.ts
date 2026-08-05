import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
  allowedDevOrigins: ['localhost:3000', '192.168.0.104:3000', '192.168.0.104', 'localhost'],
};

export default nextConfig;
