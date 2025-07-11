import type { Feature, Polygon } from 'geojson';

export interface MapSector {
  id: string;
  name: string;
  geojson: Feature<Polygon>;
  wateredAt?: string;
}
