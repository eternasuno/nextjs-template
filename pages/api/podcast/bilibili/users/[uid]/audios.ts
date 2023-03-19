import {
  Audio,
  getAudioInfo,
  getSubAUIdList,
  getUserInfo,
  User,
} from '@/lib/bilibili';
import tryGet from '@/lib/cache';
import config from '@/lib/config';
import withPodcast from '@/lib/middleware/with-podcast';
import { Feed, FeedItem } from '@/lib/podcast';
import { NextApiRequest } from 'next';

const handler = async (req: NextApiRequest) => {
  const uid = req.query.uid as string;
  const host = req.headers.host;
  const limit =
    typeof req.query.limit === 'string'
      ? parseInt(req.query.limit)
      : config.limit;

  const [user, auidList] = await Promise.all([
    tryGet<User>(
      `bilibili_user_${uid}`,
      async () => await getUserInfo(uid),
      config.cache.lastingExpire,
    ),
    getSubAUIdList(uid, limit),
  ]);

  const audioList = await Promise.all(
    auidList.map(async (auid) => {
      return await tryGet<Audio>(
        `bilibili_audio_${auid}`,
        async () => {
          return getAudioInfo(auid);
        },
        config.cache.lastingExpire,
      );
    }),
  );

  const feedItemList = audioList.map((audio) => {
    const { id, name, image, duration, pubDate, description } = audio;

    return {
      title: name,
      description,
      url: `https://www.bilibili.com/audio/au${id}`,
      pubDate,
      enclosure_url: `https://${host}/api/sounds/bilibili/audios/${id}`,
      enclosure_type: 'audio/mp4',
      duration,
      image,
    } as FeedItem;
  });

  const { name, description, image } = user;

  return {
    title: name,
    author: `${name}的音频投稿`,
    description,
    url: `https://space.bilibili.com/${uid}/audio`,
    image,
    items: feedItemList,
  } as Feed;
};

export default withPodcast(handler);
