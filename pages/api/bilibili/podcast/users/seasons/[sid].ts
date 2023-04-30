import {
  getSeasonInfo,
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
  const sid = req.query.sid as string;
  const host = req.headers.host;
  const limit =
    typeof req.query.limit === 'string'
      ? parseInt(req.query.limit)
      : config.limit;

  const [user, season] = await Promise.all([
    tryGet<User>(
      `bilibili_user_${uid}`,
      async () => await getUserInfo(uid),
      config.cache.lastingExpire,
    ),
    getSeasonInfo(sid, limit),
  ]);

  const videoList = await Promise.all(
    season.bvidList.map(async (bvid) => {
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
      enclosure_url: `https://${host}/bilibili/sounds/videos/${bvid}/${cid}`,
      enclosure_type: 'audio/mp4',
      duration,
      image,
    } as FeedItem;
  });

  return {
    title: season.name,
    author: user.name,
    description: season.description || user.description,
    url: `https://space.bilibili.com/${uid}/channel/collectiondetail?sid=${sid}`,
    image: season.image,
    items: feedItemList,
  } as Feed;
};

export default withPodcast(handler);
