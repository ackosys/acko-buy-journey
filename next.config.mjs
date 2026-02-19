/** @type {import('next').NextConfig} */
const isGhPages = process.env.GITHUB_PAGES === 'true';
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  ...(isGhPages && {
    basePath: '/acko-buy-journey',
    assetPrefix: '/acko-buy-journey/',
  }),
};

export default nextConfig;
