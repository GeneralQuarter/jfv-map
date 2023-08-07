import { onMount } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';

type CreateCachedApiCall<T> = [
  data: T,
]
 
export function createCachedApiCall<T extends object>(name: string, fetchData: () => Promise<T>, initialData: T): CreateCachedApiCall<T> {
  const [data, setData] = createStore<T>(initialData);
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
    setData(reconcile(getCached()));

    if (!navigator.onLine || !import.meta.env.PROD) {
      return;
    }

    fetchData().then(d => {
      localStorage.setItem(cacheKey, JSON.stringify(d));
      setData(reconcile(d));
    });
  });

  return [data];
}
