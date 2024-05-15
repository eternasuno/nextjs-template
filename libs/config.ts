export const CACHE_LONG_TERM = 43_200_000;

export const CACHE_SHORT_TREM = 3_600_000;

export const DEV = Deno.env.get('DENO_ENV') === 'development';

export const MAX_FEED_ITEMS = 12;

export const RESPONSE_TTL = 300_000;

export const TOKEN = Deno.env.get('TOKEN');
