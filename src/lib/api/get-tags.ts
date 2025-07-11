import type { Tags } from '@/models/tags';

export default function getTags(): Promise<Tags> {
  return fetch(`${import.meta.env.VITE_API_BASE_URL ?? ''}/tags`).then((res) =>
    res.json(),
  );
}
