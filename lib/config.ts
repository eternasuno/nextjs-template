import { env } from 'process';

const { CACHE_TYPE, CACHE_EXPIRE, CACHE_LASTING_EXPIRE, REDIS_URI } = env;

const config = {
  agent:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15',
  limit: 30,
  cache: {
    type: CACHE_TYPE,
    expire: CACHE_EXPIRE ? parseInt(CACHE_EXPIRE) : 300,
    lastingExpire: CACHE_LASTING_EXPIRE
      ? parseInt(CACHE_LASTING_EXPIRE)
      : 14400,
  },
  redis: {
    uri: REDIS_URI,
  },
};

export default config;
