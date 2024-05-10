import { getRandomUpperCase } from './random.ts';
import { getUserAgent } from './user-agents.ts';
import { tryGet } from './cache.ts';
import { md5 } from './crypto.ts';

export const getUserInfo = tryGet(
  async (id: string) => {
    type Data = { sign: string; mid: string; face: string; name: string };

    const url = new URL('https://api.bilibili.com/x/space/wbi/acc/info');
    url.searchParams.append('mid', id);

    const { sign, mid, face, name } = await getApi<Data>(url);

    return { description: sign, id: mid, image: face, name };
  },
  'user',
  43_200_000,
);

export const getUserVideoList = async (id: string, limit: number, keyword?: string) => {
  type Data = { list: { vlist: { bvid: string }[] } };

  const url = new URL('https://api.bilibili.com/x/space/wbi/arc/search');
  url.searchParams.append('mid', id);
  url.searchParams.append('ps', String(limit));
  keyword && url.searchParams.append('keyword', keyword);

  const { list: { vlist } } = await getApi<Data>(url);

  return Promise.all(vlist.map(({ bvid }) => getVideoInfo(bvid)));
};

export const getSeasonInfo = tryGet(
  async (id: string) => {
    type Data = { meta: { total: number; description: string; cover: string; name: string } };

    const url = new URL('https://api.bilibili.com/x/polymer/space/seasons_archives_list');
    url.searchParams.append('mid', '1');
    url.searchParams.append('season_id', id);
    url.searchParams.append('page_num', '1');
    url.searchParams.append('page_size', '1');

    const { meta: { total, description, cover, name } } = await getApi<Data>(url);

    return { total, description, id, image: cover, name };
  },
  'season',
  3_600_000,
);

export const getSeasonVideoList = tryGet(
  async (id: string, total: number, limit: number) =>
    Promise.all(
      (
        await Promise.all(
          Array.from({ length: Math.ceil(total / 99) }, (_, index) => index + 1).map(
            async (page) => {
              type Data = { archives: { bvid: string; pubdate: number }[] };

              const url = new URL(
                'https://api.bilibili.com/x/polymer/space/seasons_archives_list',
              );
              url.searchParams.append('mid', '1');
              url.searchParams.append('season_id', id);
              url.searchParams.append('page_num', String(page));
              url.searchParams.append('page_size', '99');

              const { archives } = await getApi<Data>(url);

              return archives;
            },
          ),
        )
      )
        .reduce((acc, item) => acc.concat(item), [])
        .sort((a, b) => b.pubdate - a.pubdate)
        .slice(0, limit)
        .map(({ bvid }) => getVideoInfo(bvid)),
    ),
  'season_videos',
  3_600_000,
);

export const getVideoPath = tryGet(
  async (bvid: string, cid: string) => {
    const url = new URL('https://api.bilibili.com/x/player/playurl');
    url.searchParams.append('bvid', bvid);
    url.searchParams.append('cid', cid);
    url.searchParams.append('platform', 'html5');

    const { durl: [{ url: path }] } = await getApi<{ durl: [{ url: string }] }>(url);

    return path;
  },
  'video_path',
  3_600_000,
);

const getVideoInfo = tryGet(
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

    const { desc, owner: { name }, pages, pic, pubdate, title } = await getApi<Data>(url);

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
  43_200_000,
);

const getApi = async <T>(url: URL) => {
  const signedUrl = await signUrl(url);
  const { code, data, message } = await get<T>(signedUrl);
  if (code !== 0) {
    throw new Error(`${url.pathname}-${message}`);
  }

  return data;
};

const signUrl = async (url: URL) => {
  url.searchParams.append('dm_img_list', '[]');
  url.searchParams.append('dm_img_str', getRandomUpperCase(2));
  url.searchParams.append('dm_cover_img_str', getRandomUpperCase(2));
  url.searchParams.append('dm_img_inter', '{"ds":[],"wh":[0,0,0],"of":[0,0,0]}');
  url.searchParams.append('wts', String(Math.round(Date.now() / 1000)));
  url.searchParams.sort();

  const salt = await getWbiSalt();
  const search = url.searchParams.toString().replace(/(?:%21|%27|%28|%29|\*)/g, '');

  url.search = `${search}&w_rid=${md5(`${search}${salt}`)}`;

  return url;
};

const getWbiSalt = tryGet(
  async () => {
    type Data = { wbi_img: { img_url: string; sub_url: string } };

    const { data: { wbi_img: { img_url, sub_url } } } = await get<Data>(
      'https://api.bilibili.com/x/web-interface/nav',
    );
    const originalSalt = `${img_url.split(/[./]/).at(-2)}${sub_url.split(/[./]/).at(-2)}`;

    // deno-fmt-ignore
    const mixinKeyEncTab = [
      46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35,
      27, 43, 5, 49, 33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13,
    ];

    return mixinKeyEncTab.map((index) => originalSalt.charAt(index)).join('');
  },
  'salt',
  43_200_000,
);

const get = async <T>(url: URL | string) => {
  const response = await fetch(url, {
    headers: {
      'user-agent': getUserAgent(),
      referer: 'https://space.bilibili.com',
    },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response.json() as Promise<{ code: number; message: string; data: T }>;
};
