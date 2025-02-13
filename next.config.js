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
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  experimental: {
    typedRoutes: true,
    serverComponentsExternalPackages: ['@nestjs/common', '@nestjs/typeorm'],
  },
  webpack: (config, { isServer }) => {
    // Exclude backend directory from compilation
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/backend/**', '**/.git/**', '**/cypress/**']
    };

    // Add module aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '/src',
    };

    // Exclude backend from compilation
    config.module = {
      ...config.module,
      exprContextCritical: false,
      rules: [
        ...config.module.rules,
        {
          test: /backend\//,
          loader: 'ignore-loader'
        }
      ]
    };

    return config;
  }
}

module.exports = nextConfig 