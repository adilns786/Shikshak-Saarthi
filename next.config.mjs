/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "vesit.ves.ac.in",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "date-fns",
    ],
  },
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,
  poweredByHeader: false,
  generateEtags: false,
  onDemandEntries: {
    maxInactiveAge: 30 * 1000,
    pagesBufferLength: 2,
  },
};

export default nextConfig;
