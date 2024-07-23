import { getWithWbi } from './get.ts';
import { tryGetLong } from '../cache.ts';

export const getUserInfo = tryGetLong(
  async (id: string) => {
    type Data = { sign: string; mid: string; face: string; name: string };

    const url = new URL('https://api.bilibili.com/x/space/wbi/acc/info');
    url.searchParams.append('mid', id);

    const { sign, mid, face, name } = await getWithWbi<Data>(
      url,
      `https://space.bilibili.com/${id}`,
    );

    return { description: sign, id: mid, image: face, name };
  },
  'user',
  true,
);

export const getUserVideoList = async (id: string, limit: number, keyword?: string) => {
  type Data = { list: { vlist: { bvid: string }[] } };

  const url = new URL('https://api.bilibili.com/x/space/wbi/arc/search');
  url.searchParams.append('mid', id);
  url.searchParams.append('ps', String(limit));
  keyword && url.searchParams.append('keyword', keyword);

  const { list: { vlist } } = await getWithWbi<Data>(url, `https://space.bilibili.com/${id}`);

  return Promise.all(vlist.map(({ bvid }) => getVideoInfo(bvid)));
};

export const getVideoPath = async (bvid: string, cid: string) => {
  type Data = { durl: [{ url: string }] };

  const url = new URL('https://api.bilibili.com/x/player/playurl');
  url.searchParams.append('bvid', bvid);
  url.searchParams.append('cid', cid);
  url.searchParams.append('platform', 'html5');

  const { durl: [{ url: path }] } = await getWithWbi<Data>(url);

  return path;
};

const getVideoInfo = tryGetLong(
  async (id: string) => {
    type Data = {
      desc: string;
      owner: { name: string };
      pages: { duration: number; cid: string; page: number; part: string }[];
      pic: string;
      pubdate: string;
      title: string;
    };

    const url = new URL('https://api.bilibili.com/x/web-interface/view');
    url.searchParams.append('bvid', id);

    const { desc, owner: { name }, pages, pic, pubdate, title } = await getWithWbi<Data>(url);

    const subVideoList = pages
      .map(({ duration, cid, page, part }) => ({ duration, id: cid, index: page, name: part }))
      .reverse();

    return {
      author: name,
      description: desc,
      id,
      image: pic,
      name: title,
      pubDate: new Date(Number(pubdate) * 1000),
      subVideoList,
    };
  },
  'video',
  true,
);
