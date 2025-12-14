/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    APP_API_URL: process.env.APP_API_URL || 'http://localhost:5000/api',
  },
};

module.exports = nextConfig;
