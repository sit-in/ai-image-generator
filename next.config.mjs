/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['localhost', '*.supabase.co'],
  },
  experimental: {
    serverComponentsExternalPackages: ['replicate'],
  },
}

export default nextConfig
