import type { MapSector } from '@/models/map-sector';

export function getMapSectors(): Promise<MapSector[]> {
  return fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/map-sectors`)
    .then((data) => data.json())
    .then((data) => data.items);
}
