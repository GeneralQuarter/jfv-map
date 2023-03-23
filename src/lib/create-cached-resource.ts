import { createMemo, createResource } from 'solid-js';

// TODO : redo this without createResource -> createSignal + onMount 
export function createCachedResource<T>(name: string, fetchData: () => Promise<T>) {
  const cacheKey = `jfv-${name}-v1`;

  const cached = createMemo(() => {
    const json = localStorage.getItem(cacheKey);
    let cached = null;

    try {
      cached = JSON.parse(json);
    } catch (e) {}

    return cached;
  });

  const fetchCached = () => {
    if (navigator.onLine && import.meta.env.PROD) {
      return fetchData().then(data => {
        localStorage.setItem(cacheKey, JSON.stringify(data));
        return data;
      }).catch(() => Promise.resolve(cached()));
    }

    return Promise.resolve(cached());
  }
  
  return createResource<T>(fetchCached, {initialValue: cached()});
}
