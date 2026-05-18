/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@aibh/state"],
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
};

module.exports = nextConfig;
