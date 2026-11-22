import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The CMS only runs on the laptop; these paths are not public pages.
      disallow: ['/admin', '/api/'],
    },
    sitemap: 'https://www.overflowbyte.tech/sitemap.xml',
    host: 'https://www.overflowbyte.tech',
  };
}
