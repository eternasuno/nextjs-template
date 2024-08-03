import {
  getUserInfo,
  getUserVideoList,
  getVideoPath,
} from '@/libs/bilibili/api.ts';
import { buildXML } from '@/libs/podcast.ts';
import { Hono } from '@hono/hono';

const MAX_FEED_ITEMS = Number(Deno.env.get('MAX_FEED_ITEMS')) || 12;
const TOKEN = Deno.env.get('TOKEN');

const app = new Hono();

app.get('/users/:uid', async (context) => {
  const uid = context.req.param('uid');
  const keyword = context.req.query('keyword');
  const limit = Number(context.req.query('limit')) || MAX_FEED_ITEMS;
  const { protocol, host } = new URL(context.req.url);
  const domain = `${protocol}//${host}`;

  const [user, videoList] = await Promise.all([
    getUserInfo(uid),
    getUserVideoList(uid, limit, keyword),
  ]);

  const xml = buildXML({
    title: `${keyword || '视频'} | ${user.name}`,
    author: user.name,
    description: user.description,
    image: user.image,
    link: `https://space.bilibili.com/${uid}/video`,
    items: videoList.map(({
      description,
      id: bvid,
      image,
      title,
      pubDate,
      subVideoList: [{ id: cid, duration }],
    }) => ({
      description,
      duration,
      enclosure_type: 'video/mp4',
      enclosure_url: `${domain}/bilibili/videos/${bvid}/${cid}?token=${TOKEN}`,
      image,
      pubDate,
      title,
      link: `https://www.bilibili.com/video/${bvid}`,
    })),
  });

  return context.text(xml, 200, { 'content-type': 'text/xml' });
});

app.get('/videos/:bvid/:cid', async (context) => {
  const { bvid, cid } = context.req.param();

  return context.redirect(await getVideoPath(bvid, cid), 302);
});

export default app;
