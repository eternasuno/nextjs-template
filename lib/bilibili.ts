import { mediumCache, persistentCache } from './cache';
import { md5, randomUpperCase } from './crypto';

export type User = {
  id: string;
  name: string;
  image: string;
  description: string;
};

export type Season = {
  id: string;
  name: string;
  total: number;
  description?: string;
  image: string;
};

export type Video = {
  id: string;
  name: string;
  author: string;
  image: string;
  pubDate: Date;
  description: string;
  subVideoList: SubVideo[];
};

export type SubVideo = {
  id: string;
  index: number;
  name: string;
  duration: number;
};

export const getUserInfo = persistentCache('user', async (id: string) => {
  const url = new URL('https://api.bilibili.com/x/space/wbi/acc/info');
  url.searchParams.append('mid', id);

  const { sign, mid, face, name } = await getApi(url);

  return { description: sign, id: mid, image: face, name } as User;
});

export const getUserVideoList = async (id: string, limit: number, keyword?: string) => {
  const url = new URL('https://api.bilibili.com/x/space/wbi/arc/search');
  url.searchParams.append('mid', id);
  url.searchParams.append('ps', String(limit));
  url.searchParams.append('dm_img_list', '[]');
  url.searchParams.append('dm_img_str', randomUpperCase(2));
  url.searchParams.append('dm_cover_img_str', randomUpperCase(2));
  url.searchParams.append('dm_img_inter', '{"ds":[],"wh":[0,0,0],"of":[0,0,0]}');
  keyword && url.searchParams.append('keyword', keyword);

  const {
    list: { vlist },
  } = await getApi(url);

  return Promise.all((vlist as { bvid: string }[]).map(({ bvid }) => getVideoInfo(bvid)));
};

export const getSeasonInfo = persistentCache('season', async (id: string) => {
  const url = new URL('https://api.bilibili.com/x/polymer/space/seasons_archives_list');
  url.searchParams.append('mid', '1');
  url.searchParams.append('season_id', id);
  url.searchParams.append('page_num', '1');
  url.searchParams.append('page_size', '1');

  const {
    meta: { total, description, cover, name },
  } = await getApi(url);

  return { total, description, id, image: cover, name } as Season;
});

export const getSeasonVideoList = async (id: string, total: number, limit: number) =>
  Promise.all(
    (
      await Promise.all(
        Array.from({ length: Math.ceil(total / 99) }, (_, index) => index + 1).map(
          async (page) => {
            const url = new URL(
              'https://api.bilibili.com/x/polymer/space/seasons_archives_list',
            );
            url.searchParams.append('mid', '1');
            url.searchParams.append('season_id', id);
            url.searchParams.append('page_num', String(page));
            url.searchParams.append('page_size', '99');

            const { archives } = await getApi(url);

            return archives as { bvid: string; pubdate: number }[];
          },
        ),
      )
    )
      .reduce((acc, item) => acc.concat(item), [])
      .sort((a, b) => b.pubdate - a.pubdate)
      .slice(0, limit)
      .map(({ bvid }) => getVideoInfo(bvid)),
  );

export const getVideoPath = mediumCache('video_path', async (bvid: string, cid: string) => {
  const url = new URL('https://api.bilibili.com/x/player/playurl');
  url.searchParams.append('bvid', bvid);
  url.searchParams.append('cid', cid);
  url.searchParams.append('platform', 'html5');

  const {
    durl: [{ url: path }],
  } = await getApi(url);

  return path as string;
});

const getVideoInfo = persistentCache('video', async (id: string) => {
  const url = new URL('https://api.bilibili.com/x/web-interface/view');
  url.searchParams.append('bvid', id);

  const {
    desc,
    owner: { name },
    pages,
    pic,
    pubdate,
    title,
  } = await getApi(url);

  const subVideoList = (pages as { [key: string]: string | number }[])
    .map(({ duration, cid, page, part }) => ({ duration, id: cid, index: page, name: part }))
    .reverse();

  return {
    author: name,
    description: desc,
    id,
    image: pic,
    name: title,
    pubDate: new Date(parseInt(pubdate) * 1000),
    subVideoList,
  } as Video;
});

const getApi = async (url: URL) => {
  const signedUrl = await signSearch(url);
  const { code, message, data } = await (await get(signedUrl)).json();

  if (code !== 0) {
    throw new Error(message);
  }

  return data;
};

const signSearch = async (url: URL) => {
  url.searchParams.append('wts', String(Math.round(Date.now() / 1000)));
  url.searchParams.sort();

  const search = url.searchParams.toString().replace(/(?:%21|%27|%28|%29|\*)/g, '');

  const salt = await getWbiSalt();
  url.search = `${search}&w_rid=${md5(`${search}${salt}`)}`;

  return url;
};

const getWbiSalt = persistentCache('salt', async () => {
  const {
    data: {
      wbi_img: { img_url, sub_url },
    },
  } = await (await get('https://api.bilibili.com/x/web-interface/nav')).json();

  const originalSalt = img_url.split(/[./]/).at(-2) + sub_url.split(/[./]/).at(-2);

  const mixinKeyEncTab = [
    46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49, 33, 9, 42, 19,
    29, 28, 14, 39, 12, 38, 41, 13,
  ];

  return mixinKeyEncTab.map((index) => originalSalt.charAt(index)).join('');
});

const get = async (url: URL | string) => {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15',
    },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response;
};
