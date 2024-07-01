import { $ } from "@builder.io/qwik";

type CachedData<T> = {
  data: T;
  maxAge: number;
};

export const useCache = <T>(
  cacheKey: string,
  cacheDuration: number | false,
) => {
  const getCache$ = $((): Record<string, CachedData<T>> => {
    if (cacheDuration === false) return {};
    try {
      const cachedData = JSON.parse(sessionStorage.getItem(cacheKey) || "{}");

      return Object.keys(cachedData).reduce(
        (acc, key) => {
          if (cachedData[key].maxAge - Date.now() >= 0)
            acc[key] = cachedData[key];

          return acc;
        },
        {} as Record<string, CachedData<T>>,
      );
    } catch (error) {
      return {};
    }
  });

  const setCache$ = $(async (key: string, data: T) => {
    if (cacheDuration === false) return; // Skip cache
    const cachedData = await getCache$();

    cachedData[key] = { data, maxAge: Date.now() + cacheDuration * 1000 };

    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(cachedData));
    } catch (error) {
      // Skip exception
    }
  });

  const clearCache$ = $(() => {
    if (cacheDuration === false) return; // Skip cache
    try {
      sessionStorage.removeItem(cacheKey);
    } catch (error) {
      // Skip exception
    }
  });

  return { getCache$, setCache$, clearCache$ };
};
