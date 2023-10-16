import { kv } from '@vercel/kv';
import { Config, Store, caching } from 'cache-manager';
import config from '../config';

const createStore = (config?: Config) => {
    const defaultTtl = config?.ttl || 3 * 60 * 1000;

    return {
        del: async (key) => {
            kv.del(key);
        },
        get: async (key) => {
            return (await kv.get(key)) || undefined;
        },
        keys: async (pattern) => kv.keys(pattern || '*'),
        mdel: async (...args) => {
            kv.del(...args);
        },
        mget: async (...args) => kv.mget(...args),
        mset: async (args, ttl) => {
            const multi = kv.multi();

            args.forEach(([key, value]) => {
                multi.set(key, value, { px: ttl || defaultTtl });
            });

            multi.exec();
        },
        reset: async () => {
            kv.flushdb();
        },
        set: async (key, data, ttl) => {
            kv.set(key, data, {
                px: ttl || defaultTtl,
            });
        },
        ttl: async (key) => kv.pttl(key),
    } as Store;
};

const createCache = async () =>
    caching(createStore, {
        ttl: config.cache.expire,
    });

export default createCache;
