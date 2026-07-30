export function pairUserIds(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

/** Real GPS haversine. Returns null when either side lacks coordinates. */
export function haversineKm(
  latA: number,
  lngA: number,
  latB: number,
  lngB: number
): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(latB - latA);
  const dLng = toRad(lngB - lngA);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(latA)) * Math.cos(toRad(latB)) * Math.sin(dLng / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)) * 10) / 10;
}

/**
 * Prefer real GPS distance. Without coords, return a large value so fake km
 * does not pass distance filters in discover / nearby.
 */
export function estimateDistanceKm(
  cityA?: string | null,
  cityB?: string | null,
  latA?: number | null,
  lngA?: number | null,
  latB?: number | null,
  lngB?: number | null
): number {
  if (
    latA != null &&
    lngA != null &&
    latB != null &&
    lngB != null &&
    Number.isFinite(latA) &&
    Number.isFinite(lngA) &&
    Number.isFinite(latB) &&
    Number.isFinite(lngB)
  ) {
    return haversineKm(latA, lngA, latB, lngB);
  }
  // No reliable GPS — exclude from radius matching
  void cityA;
  void cityB;
  return 9999;
}
