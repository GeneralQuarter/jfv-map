import { Plant } from '@/models/plant';

export function getPlantsWithPosition(): Promise<Plant[]> {
  return fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/plants-with-position`)
    .then(data => data.json())
    .then(data => data.items);
}
