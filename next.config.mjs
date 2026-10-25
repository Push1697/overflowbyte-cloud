/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/visuals/linux-permissions',
        destination: '/visuals/linux-permissions-visual.html',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/visuals/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://overflowbyte.cloud https://*.overflowbyte.cloud https://blog.overflowbyte.cloud https://learning.overflowbyte.cloud https://*.hashnode.dev https://*.medium.com",
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
