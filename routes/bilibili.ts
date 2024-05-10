import { Hono } from 'https://deno.land/x/hono@v4.3.3/mod.ts';
import {
  getSeasonInfo,
  getSeasonVideoList,
  getUserInfo,
  getUserVideoList,
  getVideoPath,
} from '../libs/bilibili.ts';
import { buildXML } from '../libs/podcast.ts';

const MAX_FEED_ITEMS = 12;

const app = new Hono();

app.get('/users/:uid', async (context) => {
  const { uid } = context.req.param();
  const { limit, keyword } = context.req.query();
  const { protocol, host } = new URL(context.req.url);
  const domain = `${protocol}//${host}`;

  const [user, videoList] = await Promise.all([
    getUserInfo(uid),
    getUserVideoList(uid, Number(limit || MAX_FEED_ITEMS), keyword),
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
        enclosure_url: `${domain}/bilibili/videos/${bvid}/${cid}`,
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

app.get('/users/:uid/seasons/:sid', async (context) => {
  const { uid, sid } = context.req.param();
  const { limit } = context.req.query();
  const { protocol, host } = new URL(context.req.url);
  const domain = `${protocol}//${host}`;

  const [user, season] = await Promise.all([getUserInfo(uid), getSeasonInfo(sid)]);
  const videoList = await getSeasonVideoList(
    sid,
    season.total,
    Number(limit || MAX_FEED_ITEMS),
  );

  const xml = buildXML({
    author: user.name,
    description: season.description || user.description,
    image: season.image || user.image,
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
        enclosure_url: `${domain}/bilibili/videos/${bvid}/${cid}`,
        image,
        pubDate,
        title,
        link: `https://www.bilibili.com/video/${bvid}`,
      };
    }),
    title: season.name,
    link: `https://space.bilibili.com/${uid}/channel/collectiondetail?sid=${sid}`,
  });

  return context.text(xml, 200, { 'content-type': 'text/xml' });
});

app.get('/videos/:bvid/:cid', async (context) => {
  const { bvid, cid } = context.req.param();

  return context.redirect(await getVideoPath(bvid, cid), 302);
});

export default app;
