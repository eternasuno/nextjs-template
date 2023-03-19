import {
  getSubBVIdList,
  getUserInfo,
  getVideoInfo,
  User,
  Video,
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

  const [user, bvidList] = await Promise.all([
    tryGet<User>(
      `bilibili_user_${uid}`,
      async () => await getUserInfo(uid),
      config.cache.lastingExpire,
    ),
    getSubBVIdList(uid, limit),
  ]);

  const videoList = await Promise.all(
    bvidList.map(async (bvid) => {
      return await tryGet<Video>(
        `bilibili_video_${bvid}`,
        async () => {
          return getVideoInfo(bvid);
        },
        config.cache.lastingExpire,
      );
    }),
  );

  const feedItemList = videoList.map((video) => {
    const { id: bvid, name, description, pubDate, image } = video;
    const { id: cid, duration } = video.subVideoList[0];

    return {
      title: name,
      description,
      url: `https://www.bilibili.com/video/${bvid}`,
      pubDate,
      enclosure_url: `https://${host}/api/sounds/bilibili/videos/${bvid}/${cid}`,
      enclosure_type: 'audio/mp4',
      duration,
      image,
    } as FeedItem;
  });

  const { name, description, image } = user;

  return {
    title: `${name}的视频投稿`,
    author: name,
    description,
    url: `https://space.bilibili.com/${uid}/video`,
    image,
    items: feedItemList,
  } as Feed;
};

export default withPodcast(handler);
