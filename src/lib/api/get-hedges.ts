import { Hedge } from '@/models/hedge';

export function getHedges(): Promise<Hedge[]> {
  return fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/hedges`)
    .then(data => data.json())
    .then(data => data.items);
}
