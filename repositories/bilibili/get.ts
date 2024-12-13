import { md5 } from '@/utils/crypto.ts';
import { getRandomItem, getRandomUpperCase } from '@/utils/random.ts';
import { tryGetLong } from '@/utils/try-get.ts';

const userAgents = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15',
];

// deno-fmt-ignore
const mixinKeyEncTab = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35,
  27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13,
];

const getWebId = tryGetLong(
  async () => {
    const response = await fetch('https://space.bilibili.com/1/video');
    const html = await response.text();
    const matched = html.match(
      /<script id="__RENDER_DATA__" type="application\/json">(.*)<\/script>/,
    );
    if (!matched) {
      return '';
    }

    const renderData = JSON.parse(decodeURIComponent(matched[1]));

    return renderData['access_id'] as string;
  },
  ['bilibili_web_id'],
  false,
);

const getSalt = tryGetLong(
  async () => {
    const response = await fetch(
      'https://api.bilibili.com/x/web-interface/nav',
    );
    const { data: { wbi_img: { img_url, sub_url } } } = await response
      .json() as {
        data: { wbi_img: { img_url: string; sub_url: string } };
      };

    const originalSalt = [img_url, sub_url].map((str) =>
      str.split(/\.|\//).at(-2)
    ).join('');

    return mixinKeyEncTab.map((index) => originalSalt.charAt(index)).join(
      '',
    );
  },
  ['bilibili_salt'],
  false,
);

const sign = async (_url: URL | string) => {
  const url = new URL(_url);

  const webId = await getWebId();

  url.searchParams.append('dm_img_list', '[]');
  url.searchParams.append('dm_img_str', getRandomUpperCase(2));
  url.searchParams.append('dm_cover_img_str', getRandomUpperCase(2));
  url.searchParams.append(
    'dm_img_inter',
    '{"ds":[],"wh":[0,0,0],"of":[0,0,0]}',
  );
  url.searchParams.append('w_webid', webId);
  url.searchParams.append('wts', String(Math.round(Date.now() / 1000)));
  url.searchParams.sort();

  const search = url.searchParams.toString().replace(
    /(?:%21|%27|%28|%29|\*)/g,
    '',
  );
  const salt = await getSalt();
  url.search = `${search}&w_rid=${md5(`${search}${salt}`)}`;

  return url;
};

export const get = async (
  url: string | URL,
  referer = 'https://www.bilibili.com',
) => {
  const response = await fetch(await sign(url), {
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
