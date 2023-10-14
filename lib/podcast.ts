import { FeedOptions, Item, Podcast } from 'podcast';
import { md5 } from './crypto';

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
