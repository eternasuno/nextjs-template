import { env } from 'process';
import * as redisCache from '@/lib/cache/redis';

const { CACHE_TYPE, CACHE_EXPIRE } = env;

const createCache = () => {
  switch (CACHE_TYPE) {
    case 'redis':
      return redisCache;
    default:
      return {
        get: (..._: any) => null,
        set: (..._: any) => null,
      };
  }
};

const cache = createCache();

export const tryGet = async <T = string>(
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

  return value as T;
};
