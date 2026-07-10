import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["idb"],
  },
  images: {
    deviceSizes: [640, 768, 1024, 1280, 1536],
    formats: ["image/avif", "image/webp"],
  },
}

export default nextConfig
