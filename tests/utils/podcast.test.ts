import { parseXml } from '@/utils/parser.ts';
import { buildXML } from '@/utils/podcast.ts';
import { assertObjectMatch } from '@std/assert';

Deno.test('podcast build xml test', () => {
  const xml = buildXML({
    title: 'title',
    author: 'author',
    description: 'description',
    link: 'link',
    image: 'image',
    items: [{
      title: 'title',
      description: 'description',
      link: 'link',
      pubDate: 'Thu, 01 Jan 1970 00:00:00 GMT',
      enclosure_url: 'enclosure_url',
      enclosure_type: 'enclosure_type',
      duration: 0,
      image: 'image',
    }],
  });

  const query = `rss.channel.{
      title: title
      description: description
      link: link
      image: image.url
      author: "itunes:author"
      items: to_array(item)[*].{
        title: title
        description: description
        link: link
        pubDate: pubDate
        enclosure_url: enclosure."@url"
        enclosure_type: enclosure."@type"
        duration: "itunes:duration"
        image: "itunes:image"."@href"
      }
    }`;

  const result = parseXml<Record<string, string>>(xml, query, {
    clean: { doctype: true, instructions: true },
  });

  const expected = {
    title: 'title',
    author: 'author',
    description: 'description',
    link: 'link',
    image: 'image',
    items: [{
      title: 'title',
      description: 'description',
      link: 'link',
      pubDate: 'Thu, 01 Jan 1970 00:00:00 GMT',
      enclosure_url: 'enclosure_url',
      enclosure_type: 'enclosure_type',
      duration: '00:00:00',
      image: 'image',
    }],
  };

  assertObjectMatch(expected, result);
});
