import { getSeasonInfo, getUserInfo, Season, User } from '@/lib/bilibili';
import { tryGet } from '@/lib/cache';
import withPodcast, { Feed, FeedItem } from '@/lib/with-podcast';
import { NextApiRequest } from 'next';

const handler = async (req: NextApiRequest) => {
  const uid = req.query.uid as string;
  const sid = req.query.sid as string;
  const host = req.headers.host;
  const limit =
    typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 5;

  const [user, season] = await Promise.all([
    tryGet<User>(
      `bilibili_user_${uid}`,
      async () => await getUserInfo(uid),
      86400,
    ),
    tryGet<Season>(
      `bilibili_season_${sid}_${limit}`,
      async () => await getSeasonInfo(sid, limit),
    ),
  ]);

  const feedItemList = season.submissionList.map((submission) => {
    return {
      title: submission.title,
      description: submission.description,
      url: submission.url,
      date: submission.date,
      enclosure_url: `https://${host}/api/sounds/bilibili/${submission.type}/${submission.id}`,
      enclosure_type: submission.contentType,
      duration: submission.duration,
      image: submission.image,
    } as FeedItem;
  });

  return {
    title: season.title,
    author: user.name,
    description: season.description,
    url: `https://space.bilibili.com/${uid}/channel/collectiondetail?sid=${sid}`,
    image: season.image,
    items: feedItemList,
  } as Feed;
};

export default withPodcast(handler);
