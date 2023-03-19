import { default as createNoCache } from '@/lib/cache/no';
import { default as createRedisCache } from '@/lib/cache/redis';
import config from '@/lib/config';
import { md5 } from '@/lib/crypto';

export type Cache = {
  get: (..._: any) => Promise<string | null> | null;
  set: (..._: any) => Promise<void> | null;
};

const createCache = () => {
  switch (config.cache.type) {
    case 'redis':
      return createRedisCache(config.redis.uri!, config.cache.expire);
    default:
      return createNoCache();
  }
};

const cache = createCache();

const tryGet = async <T = string>(
  key: string,
  getValueFunc: () => any,
  maxAge = config.cache.expire,
  refresh = true,
) => {
  const keyMd5 = md5(key);

  const cacheVal = await cache.get(keyMd5, refresh);
  if (cacheVal) {
    try {
      return JSON.parse(cacheVal) as T;
    } catch (error) {
      return cacheVal as T;
    }
  }

  const value = await getValueFunc();
  cache.set(keyMd5, value, maxAge);
  return value as T;
};

export default tryGet;
