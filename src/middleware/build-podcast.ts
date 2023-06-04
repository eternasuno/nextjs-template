import { Middleware } from 'koa';
import config from '../config';
import tryGet from '../lib/cache';
import { buildXml } from '../lib/podcast';

const buildPodcast = (): Middleware => async (ctx, next) => {
    const {
        url,
        host,
        query: { limit: _limit },
    } = ctx;
    ctx.state.limit = parseInt(String(_limit)) || config.bilibili.limit;
    ctx.state.soundsUrl = `https://${host}/bilibili/sounds`;

    const podcast = await tryGet(url, async () => {
        const feed = await next();
        return buildXml(feed);
    });

    ctx.type = 'xml';
    ctx.body = podcast;
};

export default buildPodcast;
