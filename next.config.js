/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Mode strict untuk debugging
  swcMinify: true,       // Optimasi performa pakai SWC compiler
  output: 'standalone',  // Mode standalone (wajib di Vercel untuk API stabil)
};

module.exports = nextConfig;
