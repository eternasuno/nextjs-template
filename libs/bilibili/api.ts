import { getWithWbi } from '@/libs/bilibili/get.ts';
import type { User, Video } from '@/libs/bilibili/types.d.ts';
import { tryGetLong, tryGetShort } from '@/libs/cache.ts';
import { convert } from '@/libs/jmespath.ts';

export const getUserInfo = tryGetLong(
  async (id: string) => {
    const url = new URL('https://api.bilibili.com/x/space/wbi/acc/info');
    url.searchParams.append('mid', id);

    const data = await getWithWbi(url, `https://space.bilibili.com/${id}`);
    const query = '{ id:mid, name:name, image:face, description:sign }';

    return convert<User>(data, query);
  },
  'bilibili_user',
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
  const bvids = convert<string[]>(data, query);

  return Promise.all(bvids.map((bvid) => getVideoInfo(bvid)));
};

export const getVideoPath = tryGetShort(
  async (bvid: string, cid: string) => {
    const url = new URL('https://api.bilibili.com/x/player/wbi/playurl');
    url.searchParams.append('bvid', bvid);
    url.searchParams.append('cid', cid);
    url.searchParams.append('platform', 'html5');

    const data = await getWithWbi(url);
    const query = 'durl[0].url';

    return convert<string>(data, query);
  },
  'bilibili_video_path',
);

const getVideoInfo = tryGetLong(
  async (id: string) => {
    const url = new URL('https://api.bilibili.com/x/web-interface/wbi/view');
    url.searchParams.append('bvid', id);

    const data = await getWithWbi(url);
    const query = `{
      id: bvid,
      name: title,
      author: owner.name,
      description: desc,
      image: pic,
      pubDate: to_date(to_number(pubdate) * \`1000\`),
      subVideoList: pages[*].{ id: cid, index: page, name: part, duration: to_number(duration) }
    }`;

    return convert<Video>(data, query);
  },
  'bilibili_video',
  true,
);
