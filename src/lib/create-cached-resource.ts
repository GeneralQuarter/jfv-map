import { createMemo, createResource } from 'solid-js';

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
    if (navigator.onLine && false) {
      return fetchData();
    }

    return Promise.resolve(cached());
  }
  
  return createResource<T>(fetchCached, {initialValue: cached()});
}
