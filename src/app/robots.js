export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin',       // Keep crawlers out of your admin dashboard
        '/admin/*',     // Protect your editor routes
        '/api/*',       // Don't leak your backend configuration paths
        '/checkout/*',  // No need to index private cart/checkout paths
      ],
    },
    sitemap: 'https://bouncybucket.com/sitemap.xml',
  }
}