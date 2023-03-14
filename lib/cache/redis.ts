import Redis from 'ioredis';
import { env } from 'process';
import { Cache } from '@/lib/cache';

const { CACHE_EXPIRE, REDIS_URL } = env;

type RedisCache = Cache & {
  redis: Redis;
};

const getCacheTtlKey = (key: string) => {
  if (key.startsWith('cacheTtl:')) {
    throw Error(
      '"cacheTtl:" prefix is reserved for the internal usage, please change your cache key',
    );
  }

  return `cacheTtl:${key}`;
};

const get = async (key: string, refresh = true) => {
  if (key && cache.status.available) {
    const cacheTtlKey = getCacheTtlKey(key);
    let [value, cacheTtl] = await cache.redis.mget(key, cacheTtlKey);

    if (value && refresh) {
      if (!cacheTtl) {
        cacheTtl = CACHE_EXPIRE || '86400';
      } else {
        cache.redis.expire(cacheTtlKey, cacheTtl);
      }

      cache.redis.expire(key, cacheTtl);

      return value;
    }
  }
};

const set = (key: string, value: any, maxAge = CACHE_EXPIRE || '86400') => {
  if (!key || !cache.status.available) {
    return;
  }

  if (!value || value === 'undefined') {
    value = '';
  }

  if (typeof value === 'object') {
    value = JSON.stringify(value);
  }

  if (maxAge !== CACHE_EXPIRE) {
    cache.redis.set(getCacheTtlKey(key), maxAge, 'EX', maxAge);
  }

  return cache.redis.set(key, value, 'EX', maxAge);
};

const cache = {
  redis: {},
  status: { available: false },
  get,
  set,
} as RedisCache;

const createCache = () => {
  if (cache.status.available) {
    return cache;
  }

  const redis = new Redis(REDIS_URL!);
  redis.on('error', (error) => {
    cache.status.available = false;
    console.warn('Redis error:', error);
  });
  redis.on('end', () => {
    cache.status.available = false;
  });
  redis.on('connect', () => {
    cache.status.available = true;
    console.info('Redis connected.');
  });

  cache.redis = redis;

  return cache;
};

export default createCache;
