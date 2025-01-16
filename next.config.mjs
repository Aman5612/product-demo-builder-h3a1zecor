/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.html$/,
      include: /node_modules/,
      use: 'ignore-loader'
    });
    
    // Add fallback for Node.js core modules
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false,
      crypto: false,
      child_process: false,
      net: false,
      tls: false,
      http2: false
    };
    
    // Mark bcrypt as external to prevent client-side bundling
    config.externals = config.externals || [];
    config.externals.push('bcrypt');
    
    return config;
  }
};

export default nextConfig;
