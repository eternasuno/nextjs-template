import { Cache } from '@/lib/cache';

const createCache = () => {
  return {
    get: (..._: any) => null,
    set: (..._: any) => null,
  } as Cache;
};

export default createCache;
