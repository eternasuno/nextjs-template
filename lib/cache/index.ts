import config from '../config';
import createMemoryCache from './memory';
import createRedisCache from './redis';
import createVercelKVCache from './vercel-KV';

export default await (() => {
    switch (config.cache.type) {
        case 'redis':
            return createRedisCache();
        case 'vercel_KV':
            return createVercelKVCache();
        default:
            return createMemoryCache();
    }
})();
