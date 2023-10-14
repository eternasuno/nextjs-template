import { caching } from 'cache-manager';
import config from '../config';

const createCache = async () =>
    caching('memory', {
        max: 100,
        ttl: config.cache.expire,
    });

export default createCache;
