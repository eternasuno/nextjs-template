import { WithWbi } from '@/repositories/bilibili/wbi.ts';
import { withWebId } from '@/repositories/bilibili/web_id.ts';
import { getRandomItem } from '@/utils/random.ts';
import { retry } from '@/utils/retry.ts';

const userAgents = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
];

export const get = async (
  url: string | URL,
  referer = 'https://www.bilibili.com',
) => {
  const response = await fetch(url, {
    headers: { 'user-agent': getRandomItem(userAgents), referer },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const { code, message, data } = await response.json();
  if (code !== 0 && code !== -101) {
    throw new Error(message);
  }

  return data;
};

export const getWithSign = retry(
  async (url: URL, referer?: string) =>
    get(await WithWbi(await withWebId(url)), referer),
  { maxAttempts: 2, maxTimeout: 500, minTimeout: 200 },
);
