export const fmtUSD = (n: number, dp = 2): string =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });

export const fmtNum = (n: number, dp = 2): string =>
  n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });

export const fmtPct = (n: number): string =>
  (n >= 0 ? '+' : '') + n.toFixed(2) + '%';

export const fmtCompact = (n: number): string =>
  n >= 1e9 ? '$' + (n / 1e9).toFixed(2) + 'B'
  : n >= 1e6 ? '$' + (n / 1e6).toFixed(1) + 'M'
  : '$' + (n / 1e3).toFixed(1) + 'K';

export function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

export function series(seed: number, n: number, vol: number, base: number): number[] {
  const r = rng(seed);
  const out = [base];
  for (let i = 1; i < n; i++) out.push(Math.max(0.01, out[i - 1] * (1 + (r() - 0.48) * vol)));
  return out;
}

export function hexA(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
