import Redis from 'ioredis';
import { env } from 'process';

const { CACHE_EXPIRE, REDIS_URL } = env;

export const get = async (key: string, refresh = true) => {
  redis = await connect();

  if (key) {
    const cacheTtlKey = getCacheTtlKey(key);
    let [value, cacheTtl] = await redis.mget(key, cacheTtlKey);

    if (value && refresh) {
      if (cacheTtl) {
        redis.expire(cacheTtlKey, cacheTtl);
      } else {
        cacheTtl = CACHE_EXPIRE || '86400';
      }

      redis.expire(key, cacheTtl);
    }

    return value;
  }
};

export const set = async (
  key: string,
  value: any,
  maxAge = CACHE_EXPIRE || '86400',
) => {
  if (!key) {
    return;
  }

  redis = await connect();

  if (!value || value === 'undefined') {
    value = '';
  }

  if (typeof value === 'object') {
    value = JSON.stringify(value);
  }

  if (maxAge !== CACHE_EXPIRE) {
    redis.set(getCacheTtlKey(key), maxAge, 'EX', maxAge);
  }

  return redis.set(key, value, 'EX', maxAge);
};

const connect = async () => {
  if (redis) {
    if (!['connecting', 'connect', 'ready'].includes(redis.status)) {
      await redis.connect();
    }
    return redis;
  }

  redis = new Redis(REDIS_URL!);
  redis.on('error', (error) => {
    console.warn('Redis error:', error);
  });
  redis.on('connect', () => {
    console.info('Redis connected.');
  });

  return redis;
};

const getCacheTtlKey = (key: string) => {
  if (key.startsWith('cacheTtl:')) {
    throw Error(
      '"cacheTtl:" prefix is reserved for the internal usage, please change your cache key',
    );
  }

  return `cacheTtl:${key}`;
};

let redis: Redis | null = null;
