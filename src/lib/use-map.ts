import type { Map as MapLibreMap } from 'maplibre-gl';
import type { Accessor } from 'solid-js';
import { useMapContext } from 'solid-map-gl';

export function useMap(): Accessor<MapLibreMap | null> {
  const [ctx] = useMapContext();
  return () => ctx.map;
}
