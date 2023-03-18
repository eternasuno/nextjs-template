import { getSeasonInfo, getUserInfo, Season, User } from '@/lib/bilibili';
import { tryGet } from '@/lib/cache';
import { NextApiRequest, NextApiResponse } from 'next';
import { FeedOptions, Item, Podcast } from 'podcast';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const uid = req.query.uid as string;
  const sid = req.query.sid as string;
  const host = req.headers.host;
  const limit =
    typeof req.query.limit === 'string' ? parseInt(req.query.limit) : 5;

  try {
    const [user, season] = await Promise.all([
      tryGet<User>(
        `bilibili_user_${uid}`,
        async () => await getUserInfo(uid),
        86400,
      ),
      tryGet<Season>(
        `bilibili_user_${uid}_season_${sid}_${limit}`,
        async () => await getSeasonInfo(uid, sid, limit),
      ),
    ]);

    const feedOptions = {
      title: season.title,
      description: season.description,
      siteUrl: `https://space.bilibili.com/${uid}/channel/collectiondetail?sid=${sid}`,
      imageUrl: season.image,
      pubDate: new Date(),
      itunesAuthor: user.name,
      itunesImage: user.image,
      itunesOwner: {
        name: user.name,
      },
    } as FeedOptions;

    const itemList = season.submissionList.map((submission) => {
      return {
        title: submission.title,
        description: submission.description,
        url: submission.url,
        guid: submission.id,
        date: submission.date,
        enclosure: {
          url: `https://${host}/api/sounds/bilibili/${submission.type}/${submission.id}`,
          type: submission.contentType,
        },
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
