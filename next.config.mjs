import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Two root layouts, (site) and (payload), so unmatched URLs need a 404
    // page that brings its own <html>: src/app/global-not-found.tsx.
    globalNotFound: true,
  },
};

/* The rewrite and the permissive frame-ancestors / CORS headers that used to
   live here existed only to serve the visual lab as a standalone HTML file that
   other sites embedded in an iframe. The lab is now a real route rendered from
   React components at /visuals/linux-permissions, so none of that is needed —
   and nothing has to be allowed to frame us. */

export default withPayload(nextConfig);
