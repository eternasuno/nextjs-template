import { caching } from 'cache-manager';
import { redisInsStore } from 'cache-manager-ioredis-yet';
import Redis from 'ioredis';
import config from '../config';

const createCache = async () => {
    if (!config.redis.url) {
        throw new Error('environment variable `REDIS_URL` can not be empty.');
    }

    const match = /:\/\/\S*@(\S+):\d+/.exec(config.redis.url);
    const servername = (match && match.at(1)) || undefined;
    console.info(servername);

    return caching(
        redisInsStore(
            new Redis(config.redis.url, {
                tls: {
                    servername,
                },
            }),
            {
                ttl: config.cache.expire,
            }
        )
    );
};

export default createCache;
