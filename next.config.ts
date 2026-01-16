import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "*.strapiapp.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "*.devtunnels.ms",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
