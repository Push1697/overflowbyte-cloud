/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

/* The rewrite and the permissive frame-ancestors / CORS headers that used to
   live here existed only to serve the visual lab as a standalone HTML file that
   other sites embedded in an iframe. The lab is now a real route rendered from
   React components at /visuals/linux-permissions, so none of that is needed —
   and nothing has to be allowed to frame us. */

export default nextConfig;
