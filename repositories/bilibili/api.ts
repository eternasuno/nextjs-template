import { getWithWbi } from '@/repositories/bilibili/get.ts';
import type { User, Video } from '@/repositories/bilibili/types.d.ts';
import { parseJson } from '@/utils/parser.ts';
import { tryGetLong, tryGetMiddle } from '@/utils/try-get.ts';

export const getUserInfo = tryGetLong(
  async (id: string) => {
    const url = new URL('https://api.bilibili.com/x/space/wbi/acc/info');
    url.searchParams.append('mid', id);

    const data = await getWithWbi(url, `https://space.bilibili.com/${id}`);
    const query = '{ id:mid, name:name, image:face, description:sign }';

    return parseJson<User>(data, query);
  },
  ['bilibili', 'user'],
  true,
);

export const getUserVideoList = async (
  id: string,
  limit: number,
  keyword?: string,
) => {
  const url = new URL('https://api.bilibili.com/x/space/wbi/arc/search');
  url.searchParams.append('mid', id);
  url.searchParams.append('ps', String(limit));
  keyword && url.searchParams.append('keyword', keyword);

  const data = await getWithWbi(url, `https://space.bilibili.com/${id}`);
  const query = 'list.vlist[*].bvid';
  const bvids = parseJson<string[]>(data, query);

  return Promise.all(bvids.map((bvid) => getVideoInfo(bvid)));
};

export const getVideoPath = tryGetMiddle(
  async (bvid: string, cid: string) => {
    const url = new URL('https://api.bilibili.com/x/player/wbi/playurl');
    url.searchParams.append('bvid', bvid);
    url.searchParams.append('cid', cid);
    url.searchParams.append('platform', 'html5');
    console.debug(url);

    const data = await getWithWbi(url);
    const query = 'durl[0].url';

    return parseJson<string>(data, query);
  },
  ['bilibili', 'video_path'],
  false,
);

const getVideoInfo = tryGetLong(
  async (id: string) => {
    const url = new URL('https://api.bilibili.com/x/web-interface/wbi/view');
    url.searchParams.append('bvid', id);

    const data = await getWithWbi(url);
    const query = `{
      bvid: bvid,
      cid: pages[0].cid,
      title: title,
      duration: to_number(pages[0].duration),
      description: desc,
      image: pic,
      pubDate: to_date(to_number(pubdate) * \`1000\`)
    }`;

    return parseJson<Video>(data, query);
  },
  ['bilibili', 'video'],
  true,
);
