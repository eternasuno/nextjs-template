import { buildUserPodcast, getAudioPath } from '@/services/bilibili.ts';
import { Hono } from '@hono/hono';

const app = new Hono();

app.get('/users/:uid', async (context) => {
  const uid = context.req.param('uid');
  const keyword = context.req.query('keyword');
  const limit = Number(context.req.query('limit'));

  const xml = await buildUserPodcast(uid, limit, keyword);

  return context.text(xml, 200, { 'content-type': 'text/xml' });
});

app.get('/audios/:bvid/:cid', async (context) => {
  const { bvid, cid } = context.req.param();

  return context.redirect(await getAudioPath(bvid, cid), 302);
});

export default app;
