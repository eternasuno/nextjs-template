export type User = {
  id: string;
  name: string;
  image: string;
  description: string;
};

export type SubVideo = {
  id: string;
  index: number;
  name: string;
  duration: number;
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

export type Audio = {
  id: string;
  name: string;
  image: string;
  duration: number;
  pubDate: Date;
  description: string;
};

export type Season = {
  id: string;
  name: string;
  image: string;
  description: string;
  bvidList: string[];
};

export const getUserInfo = async (id: string) => {
  const url = new URL('https://api.bilibili.com/x/space/acc/info');
  url.searchParams.append('mid', id);

  const data = await get(url);

  return {
    id: data.mid,
    name: data.name,
    image: data.face,
    description: data.sign,
  } as User;
};

export const getSubBVIdList = async (id: string, limit: number) => {
  const url = new URL('https://api.bilibili.com/x/space/wbi/arc/search');
  url.searchParams.append('mid', id);
  url.searchParams.append('ps', String(limit));

  const {
    list: { vlist },
  } = await get(url);

  if (!Array.isArray(vlist)) {
    return [] as string[];
  }

  return vlist.map((v) => v.bvid as string);
};

export const getVideoInfo = async (id: string) => {
  const url = new URL('https://api.bilibili.com/x/web-interface/view');
  url.searchParams.append('bvid', id);

  const data = await get(url);

  const subVideoList = (data.pages as any[])
    .map((item) => {
      return {
        id: item.cid,
        index: item.page,
        name: item.part,
        duration: item.duration,
      } as SubVideo;
    })
    .reverse();

  return {
    id,
    name: data.title,
    author: data.owner.name,
    image: data.pic,
    pubDate: new Date(parseInt(data.pubdate) * 1000),
    description: data.desc,
    subVideoList,
  } as Video;
};

export const getSubAUIdList = async (id: string, limit: number) => {
  const url = new URL(
    'https://api.bilibili.com/audio/music-service/web/song/upper',
  );
  url.searchParams.append('uid', id);
  url.searchParams.append('pn', '1');
  url.searchParams.append('ps', String(limit));
  url.searchParams.append('order', '1');

  const { data } = await get(url);

  if (!Array.isArray(data)) {
    return [] as string[];
  }

  return data.map((item) => item.id as string);
};

export const getAudioInfo = async (id: string) => {
  const url = new URL(
    'https://www.bilibili.com/audio/music-service-c/web/song/info',
  );
  url.searchParams.append('sid', id);

  const { title, cover, duration, passtime, intro } = await get(url);

  return {
    id,
    name: title,
    image: cover,
    duration,
    pubDate: new Date(passtime * 1000),
    description: intro,
  } as Audio;
};

export const getSeasonInfo = async (id: string, limit: number) => {
  const url = new URL(
    'https://api.bilibili.com/x/polymer/space/seasons_archives_list',
  );
  url.searchParams.append('mid', '1');
  url.searchParams.append('season_id', id);
  url.searchParams.append('sort_reverse', 'true');
  url.searchParams.append('page_num', '1');
  url.searchParams.append('page_size', String(limit));

  const { archives, meta } = await get(url);

  if (!Array.isArray(archives) || !meta) {
    return {} as Season;
  }

  return {
    id,
    name: meta.name,
    image: meta.cover,
    description: meta.description,
    bvidList: archives.map((archive) => archive.bvid as string),
  } as Season;
};

export const getVideoPath = async (bvid: string, cid: string) => {
  const url = new URL('https://api.bilibili.com/x/player/playurl');
  url.searchParams.append('bvid', bvid);
  url.searchParams.append('cid', cid);
  url.searchParams.append('fnval', '16');

  const {
    dash: { audio },
  } = await get(url);

  return audio[0].baseUrl as string;
};

export const getAudioPath = async (id: string) => {
  const url = new URL('https://www.bilibili.com/audio/music-service-c/web/url');
  url.searchParams.append('sid', id);

  const { cdns } = await get(url);

  return cdns[0] as string;
};

const get = async (url: URL) => {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15',
    },
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const { code, message, data } = (await response.json()) as any;
  if (code !== 0) {
    throw new Error(message);
  }

  return data;
};
