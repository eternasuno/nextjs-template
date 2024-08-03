import { createReadableStream, exist, makeTempDir } from '@/libs/file.ts';
import { buildXML } from '@/libs/podcast.ts';
import { getChannelInfo, getVideoDownloadURL } from '@/libs/youtube/api.ts';
import { Hono } from '@hono/hono';
import { stream } from '@hono/hono/streaming';
import { join } from '@std/path';

const MAX_FEED_ITEMS = Number(Deno.env.get('MAX_FEED_ITEMS')) || 12;
const TOKEN = Deno.env.get('TOKEN');

const app = new Hono();

app.get('/channels/:id', async (context) => {
  const { id } = context.req.param();
  const keyword = context.req.query('keyword');
  const limit = Number(context.req.query('limit')) || MAX_FEED_ITEMS;
  const { protocol, host } = new URL(context.req.url);
  const domain = `${protocol}//${host}`;

  const channelInfo = await getChannelInfo(id, limit, keyword);

  const xml = buildXML({
    title: channelInfo.title,
    author: channelInfo.title,
    description: channelInfo.description,
    image: channelInfo.image,
    link: `https://www.youtube.com/channel/${channelInfo.id}`,
    items: channelInfo.videos.map(({
      id,
      title,
      duration,
      description,
      image,
      pubDate,
    }) => ({
      title,
      description,
      duration,
      enclosure_type: 'audio/mpeg',
      enclosure_url: `${domain}/youtube/videos/${id}?token=${TOKEN}`,
      image,
      pubDate,
      link: `https://www.youtube.com/watch?v=${id}`,
    })),
  });

  return context.text(xml, 200, { 'content-type': 'text/xml' });
});

app.get('/videos/:id', async (context) => {
  const { id } = context.req.param();
  const tempDir = await makeTempDir();
  const path = join(tempDir, `youtube_${id}_audio.mp3`);
  if (!await exist(path)) {
    const url = await getVideoDownloadURL(id);
    const response = await fetch(url);
    const writeFile = await Deno.open(path, { write: true, create: true });

    await response.body?.pipeTo(writeFile.writable);
  }

  const fileInfo = await Deno.stat(path);
  const fileSize = fileInfo.size;
  const range = context.req.header('Range');
  if (!range) {
    context.status(200);
    context.header('Accept-Ranges', 'bytes');
    context.header('Content-Length', String(fileSize));
    context.header('Content-Type', 'audio/mpeg');

    return stream(
      context,
      (stream) => stream.pipe(createReadableStream(path, 0, fileSize - 1)),
    );
  }

  const parts = range.replace(/bytes=/, '').split('-');
  const start = Number(parts[0]);
  const end = Number(parts[1]) || fileSize - 1;
  if (start >= fileSize || end >= fileSize) {
    return context.text('Requested Range Not Satisfiable', 416);
  }

  context.status(206);
  context.header('Content-Range', `bytes ${start}-${end}/${fileSize}`);
  context.header('Accept-Ranges', 'bytes');
  context.header('Content-Length', String(end - start + 1));
  context.header('Content-Type', 'audio/mpeg');

  return stream(
    context,
    (stream) => stream.pipe(createReadableStream(path, start, end)),
  );
});

export default app;
