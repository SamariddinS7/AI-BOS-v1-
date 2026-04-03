/**
 * detectAnomalies: Z-Score algoritmi orqali anomaliyalarni aniqlaydi.
 */
export function detectAnomalies<T>(arr: T[], key: keyof T) {
  const vals = arr.map(d => Number(d[key])).filter(v => !isNaN(v));
  if (vals.length < 3) return arr.map(d => ({ ...d, isAnomaly: false }));

  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const std = Math.sqrt(vals.reduce((a, b) => a + (b - mean) ** 2, 0) / vals.length);

  return arr.map(d => {
    const val = Number(d[key]);
    const zScore = std > 0 ? Math.abs((val - mean) / std) : 0;
    return {
      ...d,
      isAnomaly: zScore > 1.75, // 1.75 dan yuqori bo'lsa anomaliya
      zScore
    };
  });
}

/**
 * forecastNext: Linear Regression orqali keyingi qadamlarni prognoz qiladi.
 */
export function forecastNext(arr: any[], key: string, steps = 3): number[] {
  const ys = arr.map(d => d[key] || 0);
  const n = ys.length;
  if (n < 2) return Array(steps).fill(0);

  const sx = (n * (n - 1)) / 2;
  const sy = ys.reduce((a, b) => a + b, 0);
  const sxy = ys.reduce((a, v, i) => a + i * v, 0);
  const sx2 = (n * (n - 1) * (2 * n - 1)) / 6;

  const m = (n * sxy - sx * sy) / (n * sx2 - sx * sx || 1);
  const b = (sy - m * sx) / n;

  return Array.from({ length: steps }, (_, i) => Math.round(m * (n + i) + b));
}

/** Formatlash funksiyalari */
export const fmt = (n: number) => {
  const a = Math.abs(n);
  if (a >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (a >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return n.toString();
};

export const uzs = (n: number) => `${fmt(n)} so'm`;
