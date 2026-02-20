const basePath = process.env.NODE_ENV === 'production' ? '/acko-buy-journey' : '';

export function assetPath(path: string): string {
  if (!path.startsWith('/')) return path;
  return `${basePath}${path}`;
}
