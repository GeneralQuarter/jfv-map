export const HUE_FRACTIONS = 8;

export function colorFromHueIndex(hueIndex: number, opacity: number = 0.5): string {
  const hueDelta = Math.trunc(360 / HUE_FRACTIONS);
  return `hsla(${hueIndex * hueDelta}deg, 80%, 50%, ${opacity})`;
}
