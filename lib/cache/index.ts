import { env } from 'process';
import { default as createRedisCache } from '@/lib/cache/redis';
import { default as createNoCache } from '@/lib/cache/no';

const { CACHE_TYPE, CACHE_EXPIRE, REDIS_URI } = env;
const DEFAULT_TTL = CACHE_EXPIRE ? parseInt(CACHE_EXPIRE) : 3600;

export type Cache = {
  get: (..._: any) => Promise<string | null> | null;
  set: (..._: any) => Promise<void> | null;
};

const createCache = () => {
  switch (CACHE_TYPE) {
    case 'redis':
      return createRedisCache(REDIS_URI!, DEFAULT_TTL);
    default:
      return createNoCache();
  }
};

const cache = createCache();

export const tryGet = async <T = string>(
  key: string,
  getValueFunc: () => any,
  maxAge = DEFAULT_TTL,
  refresh = false,
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
