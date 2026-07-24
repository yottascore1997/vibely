export function pairUserIds(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export function estimateDistanceKm(
  cityA?: string | null,
  cityB?: string | null,
  latA?: number | null,
  lngA?: number | null,
  latB?: number | null,
  lngB?: number | null
): number {
  if (latA != null && lngA != null && latB != null && lngB != null) {
    const toRad = (v: number) => (v * Math.PI) / 180;
    const dLat = toRad(latB - latA);
    const dLng = toRad(lngB - lngA);
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(latA)) * Math.cos(toRad(latB)) * Math.sin(dLng / 2) ** 2;
    return Math.round(6371 * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)) * 10) / 10;
  }
  if (cityA && cityB && cityA.toLowerCase() === cityB.toLowerCase()) {
    // Stable same-city estimate (no random) so Nearby/Discover stay consistent
    const hash = `${cityA}:${cityB}`.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    return Math.round((1.5 + (hash % 40) / 10) * 10) / 10;
  }
  if (cityA && cityB) {
    return 15;
  }
  return 12;
}
