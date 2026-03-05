/** @type {import('next').NextConfig} */
const isGhPages = process.env.GITHUB_PAGES === 'true';
const subPath = process.env.GH_PAGES_SUBPATH || '';
const basePath = isGhPages ? `/acko-buy-journey${subPath}` : '';

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  ...(isGhPages && {
    basePath,
    assetPrefix: `${basePath}/`,
  }),
};

export default nextConfig;
