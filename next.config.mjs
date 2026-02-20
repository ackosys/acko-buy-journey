/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? '/acko-buy-journey' : '';

const nextConfig = {
  reactStrictMode: true,
  basePath,
  assetPrefix: basePath,
  output: 'export',
  images: { unoptimized: true },
};

export default nextConfig;
