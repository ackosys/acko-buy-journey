const basePath = process.env.GITHUB_PAGES === 'true' ? '/acko-buy-journey' : '';

export function assetPath(path: string): string {
  if (!path.startsWith('/')) return path;
  return `${basePath}${path}`;
}
