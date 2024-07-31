import { get } from '@/libs/bilibili/get.ts';
import { tryGetLong } from '@/libs/cache.ts';
import { md5 } from '@/libs/crypto.ts';
import { convert } from '@/libs/jmespath.ts';
import { getRandomUpperCase } from '@/libs/random.ts';

// deno-fmt-ignore
const mixinKeyEncTab = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35,
  27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13,
];

export const sign = async (url: URL | string) => {
  const signedURL = new URL(url);

  signedURL.searchParams.append('dm_img_list', '[]');
  signedURL.searchParams.append('dm_img_str', getRandomUpperCase(2));
  signedURL.searchParams.append('dm_cover_img_str', getRandomUpperCase(2));
  signedURL.searchParams.append(
    'dm_img_inter',
    '{"ds":[],"wh":[0,0,0],"of":[0,0,0]}',
  );
  signedURL.searchParams.append('wts', String(Math.round(Date.now() / 1000)));
  signedURL.searchParams.sort();

  const search = signedURL.searchParams.toString().replace(
    /(?:%21|%27|%28|%29|\*)/g,
    '',
  );
  const salt = await getSalt();
  signedURL.search = `${search}&w_rid=${md5(`${search}${salt}`)}`;

  return signedURL;
};

const getSalt = tryGetLong(
  async () => {
    const data = await get('https://api.bilibili.com/x/web-interface/nav');
    const originalSalt = convert<string[]>(data, 'wbi_img.*')
      .map((str) => str.split(/\.|\//).at(-2))
      .join('');

    return mixinKeyEncTab.map((index) => originalSalt.charAt(index)).join('');
  },
  'salt',
);
