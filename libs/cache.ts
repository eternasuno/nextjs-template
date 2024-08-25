const CACHE_LONG_TERM = Number(Deno.env.get('CACHE_LONG_TERM')) || 43_200_000;
const CACHE_SHORT_TREM = Number(Deno.env.get('CACHE_SHORT_TREM')) || 3_600_000;
const STORE = Deno.env.get('DENO_ENV') !== 'development';

type Value<R> = {
  data: R;
  expireAt: number;
};

export const tryGet = <T extends unknown[], R>(
  get: (...args: T) => R | Promise<R>,
  key: string,
  expireIn: number,
  refresh: boolean,
  store = STORE,
) =>
async (...args: T) => {
  const argsKey = btoa(JSON.stringify(args));
  const cache = await Deno.openKv();
  const { value } = await cache.get<Value<R>>([key, argsKey]);
  const hit = value && value.expireAt > Date.now();
  const result = hit ? value.data : await get(...args);

  if (
    (result === null || result === undefined) &&
    ((store && !hit) || (refresh && hit))
  ) {
    await cache.set(
      [key, argsKey],
      { data: result, expireAt: Date.now() + expireIn },
      { expireIn },
    );
  }

  return result;
};

export const tryGetShort = <T extends unknown[], R>(
  get: (...args: T) => R | Promise<R>,
  key: string,
  refresh = false,
) => tryGet(get, key, CACHE_SHORT_TREM, refresh);

export const tryGetLong = <T extends unknown[], R>(
  get: (...args: T) => R | Promise<R>,
  key: string,
  refresh = false,
) => tryGet(get, key, CACHE_LONG_TERM, refresh);
