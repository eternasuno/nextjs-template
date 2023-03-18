import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import { FeedOptions, Item, Podcast } from 'podcast';
import crypto from 'crypto';

export type Feed = {
  title: string;
  author: string;
  description: string;
  url: string;
  image: string;
  items: FeedItem[];
};

export type FeedItem = {
  title: string;
  description: string;
  url: string;
  date: Date | null;
  enclosure_url: string;
  enclosure_type: string;
  duration: number;
  image: string;
};

const withPodcast =
  (handler: NextApiHandler) =>
  async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const feed = (await handler(req, res)) as Feed;
      res
        .status(200)
        .setHeader('Content-Type', 'text/xml')
        .send(buildPodcast(feed));
    } catch (error: any) {
      console.warn(error);
      res.status(500).send(error.message);
    }
  };

const buildPodcast = (feed: Feed) => {
  const now = new Date();

  const feedOptions = {
    title: feed.title,
    description: feed.description,
    siteUrl: feed.url,
    imageUrl: feed.image,
    pubDate: now,
    itunesAuthor: feed.author,
    itunesImage: feed.image,
    itunesOwner: {
      name: feed.author,
    },
  } as FeedOptions;

  const itemList = feed.items.map(
    (item) =>
      ({
        title: item.title,
        description: item.description,
        url: item.url,
        guid: md5(item.url),
        date: item.date || now,
        enclosure: {
          url: item.enclosure_url,
          type: item.enclosure_type,
        },
        itunesDuration: item.duration,
        itunesImage: item.image,
        itunesTitle: item.title,
      } as Item),
  );

  const podcast = new Podcast(feedOptions, itemList);

  return podcast.buildXml();
};

const md5 = (val: string) =>
  crypto.createHash('md5').update(val).digest('hex').toString();

export default withPodcast;
