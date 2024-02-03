import { revalidateTag, unstable_cache } from 'next/cache';
import { env } from 'process';

const TRANSIENT_CACHE_EXPIRE = Number(env.TRANSIENT_CACHE_EXPIRE || 300);
const MEDIUM_CACHE_EXPIRE = Number(env.MEDIUM_CACHE_EXPIRE || 3600);
const PERSISTENT_CACHE_EXPIRE = Number(env.PERSISTENT_CACHE_EXPIRE || 43200);

type Callback = Parameters<typeof unstable_cache>[0];

export const transientCache = <T extends Callback>(key: string, cb: T) =>
  unstable_cache(cb, [key], { revalidate: TRANSIENT_CACHE_EXPIRE, tags: ['cache'] });

export const mediumCache = <T extends Callback>(key: string, cb: T) =>
  unstable_cache(cb, [key], { revalidate: MEDIUM_CACHE_EXPIRE, tags: ['cache'] });

export const persistentCache = <T extends Callback>(key: string, cb: T) =>
  unstable_cache(cb, [key], { revalidate: PERSISTENT_CACHE_EXPIRE, tags: ['cache'] });

export const clearCache = () => revalidateTag('cahce');
