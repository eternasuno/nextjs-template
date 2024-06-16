import { getRandomItem } from '../random.ts';
import { retry } from '../retry.ts';
import { sign } from './wbi.ts';

const userAgents = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:124.0) Gecko/20100101 Firefox/124.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:127.0) Gecko/20100101 Firefox/127.0',
];

export const get = async <T>(url: string | URL, referer = 'https://www.bilibili.com') => {
  const response = await fetch(url, {
    headers: {
      'user-agent': getRandomItem(userAgents),
      referer,
    },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const { code, message, data } = await response.json();
  if (code !== 0 && code !== -101) {
    throw new Error(message);
  }

  return data as T;
};

export const getWithWbi = retry(
  async <T>(url: URL, referer?: string) => get<T>(await sign(url), referer),
  1,
  500,
);
