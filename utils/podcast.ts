import { formatDuration } from '@/utils/formater.ts';

type Feed = {
  title: string;
  author: string;
  description?: string;
  link: string;
  image: string;
  items: Item[];
};

type Item = {
  title: string;
  description?: string;
  link: string;
  pubDate: string;
  enclosure_url: string;
  enclosure_type: string;
  duration: number;
  image: string;
};

export const buildXML = (
  { title, author, description, link, image, items }: Feed,
) =>
  `<?xml version="1.0" encoding="UTF-8"?>
  <rss xmlns:atom="http://www.w3.org/2005/Atom" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" version="2.0">
    <channel>
      <title><![CDATA[${title}]]></title>
      <description><![CDATA[${description}]]></description>
      <link>${link}</link>
      <generator>podcast creator</generator>
      <image>
        <url>${image}</url>
        <title><![CDATA[${title}]]></title>
        <link>${link}</link>
      </image>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <ttl>5</ttl>
      <itunes:author>${author}</itunes:author>
      <itunes:explicit>false</itunes:explicit>
      ${items.map((item) => buildItem(item)).join('\n')}
    </channel>
  </rss>`;

const buildItem = (
  {
    title,
    description,
    link,
    pubDate,
    enclosure_url,
    enclosure_type,
    duration,
    image,
  }: Item,
) =>
  `<item>
    <title><![CDATA[${title}]]></title>
    <description><![CDATA[${description}]]></description>
    <link>${link}</link>
    <guid isPermaLink="false">${btoa(link)}</guid>
    <pubDate>${pubDate}</pubDate>
    <enclosure url="${enclosure_url}" length="0" type="${enclosure_type}"/>
    <itunes:duration>${formatDuration(duration)}</itunes:duration>
    <itunes:image href="${image}"/>
  </item>`;
