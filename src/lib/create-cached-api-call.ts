import { Accessor, createSignal, onMount } from 'solid-js';

type CreateCachedApiCall<T> = [
  data: Accessor<T>,
]
 
export function createCachedApiCall<T>(name: string, fetchData: () => Promise<T>): CreateCachedApiCall<T> {
  const [data, setData] = createSignal<T | null>(null);
  const cacheKey = `jfv-${name}-v1`;

  const getCached = (): T => {
    const json = localStorage.getItem(cacheKey);
    let cached = null;

    try {
      cached = JSON.parse(json);
    } catch (e) {}

    return cached;
  }

  onMount(() => {
    setData(() => getCached());

    if (!navigator.onLine || !import.meta.env.PROD) {
      return;
    }

    fetchData().then(d => {
      localStorage.setItem(cacheKey, JSON.stringify(d));
      setData(() => d);
    });
  });

  return [data];
}
