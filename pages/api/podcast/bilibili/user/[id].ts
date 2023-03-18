import {
  getUserInfo,
  getUserSubmissionList,
  Submission,
  User,
} from '@/lib/bilibili';
import { tryGet } from '@/lib/cache';
import { NextApiRequest, NextApiResponse } from 'next';
import { FeedOptions, Item, Podcast } from 'podcast';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.id as string;
  const host = req.headers.host;
  const type = req.query.type === 'audio' ? 'audio' : 'video';
  const limit =
    typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 5;

  try {
    const [user, submissionList] = await Promise.all([
      tryGet<User>(
        `bilibili_user_${id}`,
        async () => await getUserInfo(id),
        86400,
      ),
      tryGet<Submission[]>(
        `bilibili_user_${type}_${id}_${limit}`,
        async () => await getUserSubmissionList(id, limit, type),
      ),
    ]);

    const feedOptions = {
      title: `${user.name}的${type === 'audio' ? '音频' : '视频'}投稿`,
      description: user.description,
      siteUrl: `https://space.bilibili.com/${user.id}`,
      imageUrl: user.image,
      pubDate: new Date(),
      itunesAuthor: user.name,
      itunesImage: user.image,
      itunesOwner: {
        name: user.name,
      },
    } as FeedOptions;

    const itemList = submissionList.map((submission) => {
      return {
        title: submission.title,
        description: submission.description,
        url: submission.url,
        guid: submission.id,
        author: submission.author,
        date: submission.date,
        enclosure: {
          url: `https://${host}/api/sounds/bilibili/${submission.type}/${submission.id}`,
          type: submission.contentType,
        },
        itunesAuthor: submission.author,
        itunesDuration: submission.duration,
        itunesImage: submission.image,
        itunesTitle: submission.title,
      } as Item;
    });

    const podcast = new Podcast(feedOptions, itemList);

    res
      .status(200)
      .setHeader('Content-Type', 'text/xml')
      .send(podcast.buildXml());
  } catch (error: any) {
    console.warn(error);
    res.status(500).send(error.message);
  }
};

export default handler;
