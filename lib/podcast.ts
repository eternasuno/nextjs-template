import { FeedOptions, Item, Podcast } from 'podcast';
import { md5 } from '@/lib/crypto';

export type Feed = {
  title: string;
  author: string;
  description?: string;
  url: string;
  image: string;
  items: FeedItem[];
};

export type FeedItem = {
  title: string;
  description?: string;
  url: string;
  pubDate: Date | null;
  enclosure_url: string;
  enclosure_type: string;
  duration: number;
  image: string;
};

export const buildXml = (feed: Feed) => {
  const now = new Date();
  const { title, description, url, image, author } = feed;

  const feedOptions = {
    title,
    description: description || title,
    siteUrl: url,
    imageUrl: image,
    pubDate: now,
    itunesAuthor: author,
    itunesImage: image,
    itunesOwner: {
      name: author,
    },
  } as FeedOptions;

  const itemList = feed.items.map((item) => {
    const {
      title,
      description,
      url,
      pubDate,
      enclosure_url,
      enclosure_type,
      duration,
      image,
    } = item;

    return {
      title,
      description: description || title,
      url,
      guid: md5(url),
      date: pubDate || now,
      enclosure: {
        url: enclosure_url,
        type: enclosure_type,
      },
      itunesDuration: duration,
      itunesImage: image,
      itunesTitle: title,
    } as Item;
  });

  const podcast = new Podcast(feedOptions, itemList);

  return podcast.buildXml();
};
