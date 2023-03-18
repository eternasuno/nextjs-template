import {
  getUserInfo,
  getUserSubmissionList,
  Submission,
  User,
} from '@/lib/bilibili';
import { tryGet } from '@/lib/cache';
import withPodcast, { Feed, FeedItem } from '@/lib/with-podcast';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const uid = req.query.uid as string;
  const host = req.headers.host;
  const type = req.query.type === 'audio' ? 'audio' : 'video';
  const limit =
    typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 5;

  const [user, submissionList] = await Promise.all([
    tryGet<User>(
      `bilibili_user_${uid}`,
      async () => await getUserInfo(uid),
      86400,
    ),
    tryGet<Submission[]>(
      `bilibili_submission_${uid}_${limit}_${type}`,
      async () => await getUserSubmissionList(uid, limit, type),
    ),
  ]);

  const feedItemList = submissionList.map((submission) => {
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
    title: `${user.name}的${type === 'audio' ? '音频' : '视频'}`,
    author: user.name,
    description: user.description,
    url: `https://space.bilibili.com/${user.id}/${type}`,
    image: user.image,
    items: feedItemList,
  } as Feed;
};

export default withPodcast(handler);
