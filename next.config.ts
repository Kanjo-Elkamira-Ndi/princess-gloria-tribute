import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    // Local uploads are served from /uploads/. Remote URLs aren't used.
    remotePatterns: [],
  },
};

export default nextConfig;
