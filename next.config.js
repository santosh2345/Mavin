/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa');
const runtimeCaching = require('next-pwa/cache');

module.exports = withPWA({
  reactStrictMode: true,
  pwa: {
    dest: 'public',
    disable: true,
    runtimeCaching,
  },
  images: {
    domains: [
      'localhost',
      '127.0.0.1:8000',
      'maps.googleapis.com',
      's3.amazonaws.com',
      'pixarlaravel.s3.ap-southeast-1.amazonaws.com',
      'res.cloudinary.com',
      'uploads-ssl.webflow.com',
    ],
  },
  ...(process.env.NODE_ENV === 'production' && {
    typescript: {
      ignoreBuildErrors: true,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
  }),
});
