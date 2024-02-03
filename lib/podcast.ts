import { type NextRequest, NextResponse } from 'next/server';
import { type FeedOptions, type Item, Podcast } from 'podcast';
import { clearCache, transientCache } from './cache';
import { md5 } from './crypto';

type Feed = {
  title: string;
  author: string;
  description?: string;
  url: string;
  image: string;
  items: FeedItem[];
};

type FeedItem = {
  title: string;
  description?: string;
  url: string;
  pubDate: Date | null;
  enclosure_url: string;
  enclosure_type: string;
  duration: number;
  image: string;
};

const buildXml = (feed: Feed) => {
  const now = new Date();
  const { title, description, url, image, author } = feed;

  const feedOptions = {
    description: description || title,
    imageUrl: image,
    itunesAuthor: author,
    itunesImage: image,
    itunesOwner: {
      name: author,
    },
    pubDate: now,
    siteUrl: url,
    title,
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
      date: pubDate || now,
      description: description || title,
      enclosure: {
        type: enclosure_type,
        url: enclosure_url,
      },
      guid: md5(url),
      itunesDuration: duration,
      itunesImage: image,
      itunesTitle: title,
      title,
      url,
    } as Item;
  });

  const podcast = new Podcast(feedOptions, itemList);

  return podcast.buildXml();
};

const withPodcast =
  (handle: (...args: string[]) => Promise<Feed>) =>
  async (request: NextRequest, { params }: { params: { [key: string]: string } }) => {
    const cachedHandle = transientCache('podcast', handle);

    try {
      const feed = await cachedHandle(request.url, ...Object.values(params));
      const xml = buildXml(feed);

      return new NextResponse<string>(xml, { headers: { 'Content-Type': 'text/xml' } });
    } catch (error) {
      clearCache();

      return NextResponse.json({ message: (error as Error).message }, { status: 500 });
    }
  };

export default withPodcast;
