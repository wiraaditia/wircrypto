/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Mengabaikan error TypeScript saat build
  },
  eslint: {
    ignoreDuringBuilds: true, // Mengabaikan error ESLint saat build
  },
};

export default nextConfig;
