import { format } from '@/libs/duration.ts';
import type { Feed, Item } from '@/libs/podcast.d.ts';

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
      ${items?.map((item) => buildItem(item)).join('\n')}
    </channel>
  </rss>`;

const buildItem = (
  {
    title,
    description,
    link,
    pubDate = new Date(),
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
    <pubDate>${pubDate.toUTCString()}</pubDate>
    <enclosure url="${enclosure_url}" length="0" type="${enclosure_type}"/>
    <itunes:duration>${format(duration)}</itunes:duration>
    <itunes:image href="${image}"/>
  </item>`;
