export type User = {
  id: string;
  name: string;
  image: string;
  description: string;
};

export type Submission = {
  id: string;
  type: 'video' | 'audio';
  contentType: string;
  title: string;
  date: Date;
  duration: number;
  image: string;
  url: string;
  description: string;
};

export type Season = {
  title: string;
  image: string;
  description: string;
  submissionList: Submission[];
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

export const getUserSubmissionList = async (
  id: string,
  limit: number,
  type: 'video' | 'audio' = 'video',
) => {
  return type === 'audio'
    ? await getUserAudioList(id, limit)
    : await getUserVideoList(id, limit);
};

export const getSeasonInfo = async (sid: string, limit: number) => {
  const url = new URL(
    'https://api.bilibili.com/x/polymer/space/seasons_archives_list',
  );
  url.searchParams.append('mid', '1');
  url.searchParams.append('season_id', sid);
  url.searchParams.append('sort_reverse', 'true');
  url.searchParams.append('page_num', '1');
  url.searchParams.append('page_size', String(limit));

  const { archives, meta } = await get(url);

  if (!archives || !meta) {
    return {} as Season;
  }

  const submissionList = (archives as any[]).map((archive) => {
    return {
      id: archive.bvid,
      type: 'video',
      contentType: 'audio/mp4',
      title: archive.title,
      date: new Date(archive.ctime * 1000),
      duration: archive.duration,
      image: archive.pic,
      url: `https://www.bilibili.com/video/${archive.bvid}`,
      description: '',
    } as Submission;
  });

  return {
    title: meta.name,
    image: meta.cover,
    description: meta.description,
    submissionList,
  } as Season;
};

export const getVideoPath = async (id: string) => {
  const cid = await getVideoCid(id);

  const url = new URL('https://api.bilibili.com/x/player/playurl');
  url.searchParams.append('bvid', id);
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

const getUserVideoList = async (id: string, limit: number) => {
  const url = new URL('https://api.bilibili.com/x/space/wbi/arc/search');
  url.searchParams.append('mid', id);
  url.searchParams.append('ps', String(limit));

  const {
    list: { vlist },
  } = await get(url);

  if (!vlist) {
    return [] as Submission[];
  }

  return (vlist as any[]).map((video) => {
    return {
      id: video.bvid,
      type: 'video',
      contentType: 'audio/mp4',
      title: video.title,
      date: new Date(video.created * 1000),
      duration: convertDuration(video.length),
      image: video.pic,
      url: `https://www.bilibili.com/video/${video.bvid}`,
      description: video.description,
    } as Submission;
  });
};

const getUserAudioList = async (id: string, limit: number) => {
  const url = new URL(
    'https://api.bilibili.com/audio/music-service/web/song/upper',
  );
  url.searchParams.append('uid', id);
  url.searchParams.append('pn', '1');
  url.searchParams.append('ps', String(limit));
  url.searchParams.append('order', '1');

  const { data } = await get(url);

  if (!data) {
    return [] as Submission[];
  }

  return (data as any[]).map((audio) => {
    return {
      id: audio.id,
      type: 'audio',
      contentType: 'audio/x-m4a',
      title: audio.title,
      date: new Date(audio.passtime * 1000),
      duration: audio.duration,
      image: audio.cover,
      url: `https://www.bilibili.com/audio/au${audio.id}`,
      description: audio.title,
    } as Submission;
  });
};

const getVideoCid = async (id: string) => {
  const url = new URL('https://api.bilibili.com/x/web-interface/view');
  url.searchParams.append('bvid', id);

  const { cid } = await get(url);
  return cid;
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

const convertDuration = (length: string) => {
  const times = length.split(':');
  const seconds = times.at(-1) ? parseInt(times.at(-1)!) : 0;
  const minutes = times.at(-2) ? parseInt(times.at(-2)!) : 0;
  const hours = times.at(-3) ? parseInt(times.at(-3)!) : 0;
  return hours * 3600 + minutes * 60 + seconds;
};
