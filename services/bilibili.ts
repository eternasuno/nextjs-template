import { BASE_PATH, MAX_FEED_ITEMS, TOKEN } from '@/config.ts';
import {
  getUserInfo,
  getUserVideoList,
  getVideoPath,
} from '@/repositories/bilibili/api.ts';
import { buildXML } from '@/utils/podcast.ts';
import { tryGetShort } from '@/utils/try-get.ts';

export const buildUserPodcast = tryGetShort(
  async (id: string, limit?: number, keyword?: string) => {
    const [user, videoList] = await Promise.all([
      getUserInfo(id),
      getUserVideoList(id, limit || MAX_FEED_ITEMS, keyword),
    ]);

    return buildXML({
      author: user.name,
      description: user.description,
      image: user.image,
      items: videoList.map((video) => ({
        ...video,
        enclosure_type: 'audio/mpeg',
        enclosure_url:
          `${BASE_PATH}/bilibili/audios/${video.bvid}/${video.cid}?token=${TOKEN}`,
        link: `https://www.bilibili.com/video/${video.bvid}`,
      })),
      title: `${keyword || '视频'} | ${user.name}`,
      link: `https://space.bilibili.com/${user.id}/video`,
    });
  },
  ['bilibili', 'user_podcast'],
  false,
);

export const getAudioPath = (bvid: string, cid: string) =>
  getVideoPath(bvid, cid);
