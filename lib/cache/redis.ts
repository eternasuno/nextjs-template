import { caching } from 'cache-manager';
import { redisInsStore } from 'cache-manager-ioredis-yet';
import Redis from 'ioredis';
import config from '../config';

const createCache = async () => {
    if (!config.redis.url) {
        throw new Error('environment variable `REDIS_URL` can not be empty.');
    }

    const redis = new Redis(config.redis.url);
    return caching(
        redisInsStore(redis, {
            ttl: config.cache.expire,
        })
    );
};

export default createCache;
