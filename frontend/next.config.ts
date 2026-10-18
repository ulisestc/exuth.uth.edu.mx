import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/admin-login',
        destination: '/login?tipo=admin',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
