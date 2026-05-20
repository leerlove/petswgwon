import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['sharp', 'heic-convert'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'yngzeshxngfeyiabxeyi.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
