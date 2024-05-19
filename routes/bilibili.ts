import { buildXML } from '../libs/podcast.ts';
import { DEV, MAX_FEED_ITEMS, RESPONSE_TTL, TOKEN } from '../libs/config.ts';
import { getUserInfo, getUserVideoList, getVideoPath } from '../libs/bilibili/api.ts';
import { Hono, MiddlewareHandler } from 'https://deno.land/x/hono@v4.3.7/mod.ts';

const app = new Hono();

const cache: MiddlewareHandler = async (context, next) => {
  const cache = await Deno.openKv();
  const key = btoa(context.req.url);
  const { value } = await cache.get<string>(['podcast', key]);
  if (value !== null) {
    return context.text(value, 200, { 'content-type': 'text/xml' });
  }

  await next();

  if (!DEV && context.res.ok) {
    const result = await context.res.clone().text();
    await cache.set(['podcast', key], result, { expireIn: RESPONSE_TTL });
  }
};

app.get('/users/:uid', cache, async (context) => {
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
    author: user.name,
    description: user.description,
    image: user.image,
    items: videoList.map((video) => {
      const {
        id: bvid,
        name: title,
        description,
        pubDate,
        image,
        subVideoList: [{ id: cid, duration }],
      } = video;

      return {
        description,
        duration,
        enclosure_type: 'video/mp4',
        enclosure_url: `${domain}/bilibili/videos/${bvid}/${cid}?token=${TOKEN}`,
        image,
        pubDate,
        title,
        link: `https://www.bilibili.com/video/${bvid}`,
      };
    }),
    title: `${keyword || '视频'} | ${user.name}`,
    link: `https://space.bilibili.com/${uid}/video`,
  });

  return context.text(xml, 200, { 'content-type': 'text/xml' });
});

app.get('/videos/:bvid/:cid', async (context) => {
  const { bvid, cid } = context.req.param();

  return context.redirect(await getVideoPath(bvid, cid), 302);
});

export default app;
