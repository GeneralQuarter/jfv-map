import { Rectangle } from '@/models/rectangle';

export function getRectangles(): Promise<Rectangle[]> {
  return fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/rectangles-with-coords`)
    .then(data => data.json())
    .then(data => data.items);
}
