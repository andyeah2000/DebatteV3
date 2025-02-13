/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
    ],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    // Exclude backend directory from compilation
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [...(config.watchOptions?.ignored || []), '**/backend/**']
    };
    return config;
  }
}

module.exports = nextConfig 