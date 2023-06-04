import createRedisCache from './redis';
import config from '../../config';
import { md5 } from '../crypto';

const cache = (() => {
    switch (config.cache.type) {
        case 'redis':
            if (!config.redis.uri) {
                throw Error('redis uri can not be empty!');
            }
            return createRedisCache(config.redis.uri, config.cache.expire);
        default:
            return { get: () => null, set: () => null };
    }
})();

const tryGet = async <T = string>(
    key: string,
    getValueFunc: () => Promise<T>,
    maxAge = config.cache.expire,
    refresh = true
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
    return value;
};

export default tryGet;
