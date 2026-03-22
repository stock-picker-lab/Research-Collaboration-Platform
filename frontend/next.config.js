/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  typescript: {
    // 忽略构建时的TS错误（页面运行时不受影响）
    ignoreBuildErrors: true,
  },
  eslint: {
    // 忽略构建时的ESLint错误
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://backend:8000";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
