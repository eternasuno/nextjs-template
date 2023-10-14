import { env } from 'process';

const {
    CACHE_TYPE,
    CACHE_EXPIRE,
    CACHE_LASTING_EXPIRE,
    REDIS_URL,
    FEED_ITEMS_LIMIT,
} = env;

const config = {
    cache: {
        expire: CACHE_EXPIRE ? parseInt(CACHE_EXPIRE) * 1000 : 300000,
        lasting_expire: CACHE_LASTING_EXPIRE
            ? parseInt(CACHE_LASTING_EXPIRE) * 1000
            : 7200000,
        type: CACHE_TYPE || 'memory',
    },
    feed: {
        items_limit: FEED_ITEMS_LIMIT ? parseInt(FEED_ITEMS_LIMIT) : 30,
    },
    redis: {
        url: REDIS_URL,
    },
};

export default config;
