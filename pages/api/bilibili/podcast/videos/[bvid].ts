import { getVideoInfo, Video } from '@/lib/bilibili';
import tryGet from '@/lib/cache';
import config from '@/lib/config';
import withPodcast from '@/lib/middleware/with-podcast';
import { Feed, FeedItem } from '@/lib/podcast';
import { NextApiRequest } from 'next';

const handler = async (req: NextApiRequest) => {
  const bvid = req.query.bvid as string;
  const host = req.headers.host;

  const video = await tryGet<Video>(
    `bilibili_video_${bvid}`,
    async () => await getVideoInfo(bvid),
    config.cache.lastingExpire,
  );

  const {
    name: videoName,
    author,
    description,
    pubDate,
    image,
    subVideoList,
  } = video;

  const feedItemList = subVideoList.map((sub) => {
    const { id: cid, index, name, duration } = sub;

    return {
      title: name,
      description,
      url: `https://www.bilibili.com/video/${bvid}?p=${index}`,
      pubDate,
      enclosure_url: `https://${host}/sounds/bilibili/videos/${bvid}/${cid}`,
      enclosure_type: 'audio/mp4',
      duration,
      image,
    } as FeedItem;
  });

  return {
    title: videoName,
    author,
    description,
    url: `https://www.bilibili.com/video/${bvid}`,
    image,
    items: feedItemList,
  } as Feed;
};

export default withPodcast(handler);
