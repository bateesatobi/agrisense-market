/** Resolve gallery URLs for a product (real photos or emoji data-URI placeholders). */
export function getProductImages(product: {
  images?: string[];
  imageEmoji?: string;
  title?: string;
}): string[] {
  const urls = (product.images ?? []).filter(Boolean);
  if (urls.length > 0) return urls;
  const emoji = product.imageEmoji || '🛒';
  // Single-color SVG placeholders so gallery still works offline / without photos
  return [0, 1, 2].map((i) =>
    svgPlaceholder(emoji, product.title ?? 'Product', i),
  );
}

export function getPrimaryImage(product: {
  images?: string[];
  imageEmoji?: string;
  title?: string;
}): string {
  return getProductImages(product)[0];
}

function svgPlaceholder(emoji: string, title: string, variant: number): string {
  const hues = [95, 42, 200];
  const hue = hues[variant % hues.length];
  const label = variant === 0 ? 'Main' : variant === 1 ? 'Detail' : 'Pack';
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue} 45% 88%)"/>
      <stop offset="100%" stop-color="hsl(${hue} 35% 72%)"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#g)"/>
  <text x="400" y="360" font-size="140" text-anchor="middle">${emoji}</text>
  <text x="400" y="480" font-family="Arial,sans-serif" font-size="28" fill="#1b4332" text-anchor="middle">${escapeXml(title.slice(0, 28))}</text>
  <text x="400" y="530" font-family="Arial,sans-serif" font-size="20" fill="#565959" text-anchor="middle">${label} view</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c]!,
  );
}
