import {
  getUserInfo,
  getUserVideoList,
  Submission,
  User,
} from '@/lib/bilibili';
import { tryGet } from '@/lib/cache';
import { NextApiRequest, NextApiResponse } from 'next';
import { FeedOptions, Item, Podcast } from 'podcast';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const id = req.query.id as string;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
  const host = req.headers.host;

  try {
    const [user, submissionList] = await Promise.all([
      tryGet<User>(`bilibili_user_${id}`, async () => await getUserInfo(id)),
      tryGet<Submission[]>(
        `bilibili_user_videos_${id}_${limit}`,
        async () => await getUserVideoList(id, limit),
      ),
    ]);

    const feedOptions = {
      title: `${user.name}的视频投稿`,
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
          url: `https://${host}/api/bilibili/${submission.type}/${submission.id}`,
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
