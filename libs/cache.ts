const DEV = Deno.env.get('DENO_ENV') === 'development';

export const tryGet = <T extends unknown[], R>(
  get: (...args: T) => R | Promise<R>,
  key: string,
  expireIn: number,
  refresh = false,
) =>
async (...args: T) => {
  const argsKey = btoa(JSON.stringify(args));
  const cache = await Deno.openKv();
  const { value } = await cache.get<R>([key, argsKey]);
  if (value === null) {
    const result = await get(...args);

    if (!DEV) {
      await cache.set([key, argsKey], result, { expireIn });
    }

    return result;
  }

  if (refresh) {
    await cache.set([key, argsKey], value, { expireIn });
  }

  return value;
};
