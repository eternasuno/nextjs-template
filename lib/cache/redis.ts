import Redis from 'ioredis';

const createCache = (url: string, defaultTtl: number) => {
  const redis = new Redis(url);
  redis.on('error', (error) => {
    console.warn('Redis error:', error);
  });
  redis.on('connect', () => {
    console.info('Redis connected.');
  });

  const get = async (key: string, refresh: boolean) => {
    if (!key) {
      throw Error('key can not be empty.');
    }

    const cacheTtlKey = getCacheTtlKey(key);
    const [value, cacheTtl] = await redis.mget(key, cacheTtlKey);

    if (value && refresh) {
      if (cacheTtl) {
        redis.expire(cacheTtlKey, cacheTtl);
      }

      redis.expire(key, cacheTtl || defaultTtl);
    }

    return value;
  };

  const set = async (key: string, value: any, maxAge: number) => {
    if (!key) {
      return;
    }

    if (!value || value === 'undefined') {
      value = '';
    }

    if (typeof value === 'object') {
      value = JSON.stringify(value);
    }

    if (maxAge !== defaultTtl) {
      redis.set(getCacheTtlKey(key), maxAge, 'EX', maxAge);
    }

    redis.set(key, value, 'EX', maxAge);
  };

  return { get, set };
};

const getCacheTtlKey = (key: string) => {
  if (key.startsWith('cacheTtl:')) {
    throw Error(
      '"cacheTtl:" prefix is reserved for the internal usage, please change your cache key',
    );
  }

  return `cacheTtl:${key}`;
};

export default createCache;
