/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.solara.in',
        // The pathname is important: use a wildcard (**) if the path changes
        pathname: '/cdn/shop/files/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        // If images might come from any path on this host, use this:
        pathname: '/**', 
      },
      {
        protocol: 'https',
        hostname: 'my-custom-cdn.net',
        pathname: '/**',
      },

      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**', // This allows all paths under res.cloudinary.com
      },
      // ADD MORE OBJECTS FOR ANY OTHER HOSTNAMES YOU USE
    ],
  },
};

export default nextConfig;
