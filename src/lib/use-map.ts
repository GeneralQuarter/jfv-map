import { Map } from 'maplibre-gl';
import { Accessor } from 'solid-js';
import { useMapContext } from 'solid-map-gl';

export function useMap(): Accessor<Map | null> {
  const [ctx] = useMapContext();
  return () => ctx.map;
}
