import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Two root layouts, (site) and (payload), so unmatched URLs need a 404
    // page that brings its own <html>: src/app/global-not-found.tsx.
    globalNotFound: true,
  },
  // The blog (Hashnode) and the learning garden (Quartz) used to be separate
  // sites on their own subdomains. Their content lives here now, so old links
  // land on the matching page. These only fire once the subdomain is attached
  // to this Vercel project.
  async redirects() {
    const SITE = 'https://www.overflowbyte.tech';
    const learning = [{ type: 'host', value: 'learning.overflowbyte.tech' }];
    const blog = [{ type: 'host', value: 'blog.overflowbyte.tech' }];
    const portfolio = [{ type: 'host', value: 'pushpendra.overflowbyte.tech' }];
    return [
      { source: '/pushpendra-resume.pdf', has: portfolio, destination: `${SITE}/pushpendra-resume.pdf`, permanent: true },
      { source: '/blog/:path*', has: portfolio, destination: `${SITE}/blog`, permanent: true },
      { source: '/learning/:path*', has: portfolio, destination: `${SITE}/about#learning`, permanent: true },
      { source: '/:path*', has: portfolio, destination: `${SITE}/about`, permanent: true },
      { source: '/blog/:slug', has: learning, destination: `${SITE}/notes/:slug`, permanent: true },
      { source: '/:path*', has: learning, destination: `${SITE}/notes`, permanent: true },
      { source: '/newsletter', has: blog, destination: `${SITE}/newsletter`, permanent: true },
      { source: '/:path*', has: blog, destination: `${SITE}/blog`, permanent: true },
    ];
  },
};

/* The rewrite and the permissive frame-ancestors / CORS headers that used to
   live here existed only to serve the visual lab as a standalone HTML file that
   other sites embedded in an iframe. The lab is now a real route rendered from
   React components at /visuals/linux-permissions, so none of that is needed —
   and nothing has to be allowed to frame us. */

export default withPayload(nextConfig);
