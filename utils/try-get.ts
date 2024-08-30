import {
  CACHE_ENABLE,
  CACHE_LONG_TERM,
  CACHE_MIDDLE_TERM,
  CACHE_SHORT_TREM,
} from '@/config.ts';

export const tryGet = <T extends unknown[], R>(
  get: (...args: T) => R | Promise<R>,
  key: string[],
  expireIn: number,
  refresh: boolean,
  enable = CACHE_ENABLE,
) =>
async (...args: T) => {
  using kv = await Deno.openKv();
  const argsKey = btoa(JSON.stringify(args));
  const cacheKey = [...key, argsKey];
  const { value } = await kv.get<{ data: R; expireAt: number }>(cacheKey);
  const hit = value !== null && value !== undefined &&
    value.expireAt > Date.now();
  const result = hit ? value.data : await get(...args);

  if ((!hit && enable) || (hit && refresh)) {
    const expireAt = Date.now() + expireIn;
    await kv.set(cacheKey, { data: result, expireAt }, { expireIn });
  }

  return result;
};

export const tryGetLong = <T extends unknown[], R>(
  get: (...args: T) => R | Promise<R>,
  key: string[],
  refresh: boolean,
) => tryGet(get, key, CACHE_LONG_TERM, refresh);

export const tryGetMiddle = <T extends unknown[], R>(
  get: (...args: T) => R | Promise<R>,
  key: string[],
  refresh: boolean,
) => tryGet(get, key, CACHE_MIDDLE_TERM, refresh);

export const tryGetShort = <T extends unknown[], R>(
  get: (...args: T) => R | Promise<R>,
  key: string[],
  refresh: boolean,
) => tryGet(get, key, CACHE_SHORT_TREM, refresh);
