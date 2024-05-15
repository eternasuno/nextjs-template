import { get } from './get.ts';
import { getRandomUpperCase } from '../random.ts';
import { md5 } from '../crypto.ts';
import { tryGetLong } from '../cache.ts';

// deno-fmt-ignore
const mixinKeyEncTab = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35,
  27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13,
];

export const sign = async (url: URL) => {
  url.searchParams.append('dm_img_list', '[]');
  url.searchParams.append('dm_img_str', getRandomUpperCase(2));
  url.searchParams.append('dm_cover_img_str', getRandomUpperCase(2));
  url.searchParams.append('dm_img_inter', '{"ds":[],"wh":[0,0,0],"of":[0,0,0]}');
  url.searchParams.append('wts', String(Math.round(Date.now() / 1000)));
  url.searchParams.sort();

  const search = url.searchParams.toString().replace(/(?:%21|%27|%28|%29|\*)/g, '');
  const salt = await getSalt();
  url.search = `${search}&w_rid=${md5(`${search}${salt}`)}`;

  return url;
};

const getSalt = tryGetLong(async () => {
  type Data = { wbi_img: { img_url: string; sub_url: string } };

  const url = 'https://api.bilibili.com/x/web-interface/nav';
  const { wbi_img: { img_url, sub_url } } = await get<Data>(url);
  const originalSalt = `${img_url.split(/[./]/).at(-2)}${sub_url.split(/[./]/).at(-2)}`;

  return mixinKeyEncTab.map((index) => originalSalt.charAt(index)).join('');
}, 'salt');
