import { getSeasonInfo, getSeasonVideoList, getUserInfo } from '@/lib/bilibili';
import withPodcast from '@/lib/podcast';
import { env } from 'process';

const MAX_FEED_ITEMS = Number(env.MAX_FEED_ITEMS || 12);

export const GET = withPodcast(async (url, uid, sid) => {
  const { protocol, host, searchParams } = new URL(url);
  const domain = `${protocol}//${host}`;
  const limit = Number(searchParams.get('limit') || MAX_FEED_ITEMS);

  const [user, season] = await Promise.all([getUserInfo(uid), getSeasonInfo(sid)]);
  const videoList = await getSeasonVideoList(sid, season.total, limit);

  return {
    author: user.name,
    description: season.description || user.description,
    image: season.image || user.image,
    items: videoList.map((video) => {
      const { id: bvid, name, description, pubDate, image } = video;
      const { id: cid, duration } = video.subVideoList[0];

      return {
        description,
        duration,
        enclosure_type: 'video/mp4',
        enclosure_url: `${domain}/bilibili/sounds/${bvid}/${cid}`,
        image,
        pubDate,
        title: name,
        url: `https://www.bilibili.com/video/${bvid}`,
      };
    }),
    title: season.name,
    url: `https://space.bilibili.com/${uid}/channel/collectiondetail?sid=${sid}`,
  };
});
