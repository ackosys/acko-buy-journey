/** @type {import('next').NextConfig} */
const isGhPages = process.env.GITHUB_PAGES === 'true';
const basePath = isGhPages ? '/acko-buy-journey' : '';

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: { unoptimized: true },
  ...(isGhPages && {
    basePath,
    assetPrefix: '/acko-buy-journey/',
  }),
};

export default nextConfig;
