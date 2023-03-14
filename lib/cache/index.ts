import { env } from 'process';
import { default as createRedisCache } from '@/lib/cache/redis';

const { CACHE_TYPE, CACHE_EXPIRE } = env;

export type Cache = {
  get: (..._: any) => any;
  set: (..._: any) => any;
  status: { available: boolean };
};

const createCache = () => {
  switch (CACHE_TYPE) {
    case 'redis':
      return createRedisCache();
    default:
      return {
        get: (..._) => null,
        set: (..._) => null,
        status: { available: true },
      } as Cache;
  }
};

const cache = createCache();

export const tryGet = async (
  key: string,
  getValueFunc: () => any,
  maxAge = CACHE_EXPIRE,
  refresh = true,
) => {
  let value = await cache.get(key, refresh);
  if (!value) {
    value = await getValueFunc();
    cache.set(key, value, maxAge);
  } else {
    let parsed;
    try {
      parsed = JSON.parse(value);
    } catch (error) {
      parsed = null;
    }

    if (parsed) {
      value = parsed;
    }
  }

  return value;
};
