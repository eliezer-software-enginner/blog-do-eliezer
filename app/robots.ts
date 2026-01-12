import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/login', '/create'],
    },
    sitemap: 'https://blog-do-eliezer.vercel.app/sitemap.xml',
  };
}