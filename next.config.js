/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add source-map-loader
    config.module.rules.push({
      test: /\.js$/,
      enforce: 'pre',
      use: ['source-map-loader'],
    });

    // Ignore source-map-loader warnings
    config.ignoreWarnings = [/Failed to parse source map/];

    if (!isServer) {
      // Client-side configuration
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
        stream: false,
      };
    }

    // Exclude canvas from being processed by webpack
    config.externals = [...(config.externals || []), { canvas: "canvas" }];

    return config;
  },
  transpilePackages: ['pdfjs-dist']
};

module.exports = nextConfig; 