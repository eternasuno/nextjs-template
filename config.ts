export const PORT = Number(Deno.env.get('PORT')) || 8_000;
export const BASE_PATH = Deno.env.get('BASE_PATH') || 'http://localhost:8000';

export const TOKEN = Deno.env.get('TOKEN');
export const MAX_FEED_ITEMS = Number(Deno.env.get('MAX_FEED_ITEMS')) || 12;

export const CACHE_ENABLE = Deno.env.get('DENO_ENV') !== 'development';
export const CACHE_LONG_TERM = Number(Deno.env.get('CACHE_LONG_TERM')) ||
  43_200_000;
export const CACHE_MIDDLE_TERM = Number(Deno.env.get('CACHE_MIDDLE_TERM')) ||
  3_600_000;
export const CACHE_SHORT_TREM = Number(Deno.env.get('CACHE_SHORT_TREM')) ||
  300_000;
