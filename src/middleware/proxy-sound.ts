import { Middleware } from 'koa';
import { Readable } from 'stream';
import config from '../config';
import tryGet from '../lib/cache';

const proxySound = (): Middleware => async (ctx, next) => {
    const { url, header } = ctx;
    const path = await tryGet(url, next, config.cache.lasting_expire);

    const headers = new Headers({ Referer: 'https://www.bilibili.com' });
    for (const key in header) {
        if (
            Object.prototype.hasOwnProperty.call(header, key) &&
            key !== 'host'
        ) {
            const value = header[key];
            if (Array.isArray(value)) {
                headers.append(key, value[0]);
            } else if (value) {
                headers.append(key, value);
            } else {
                headers.append(key, '');
            }
        }
    }

    const response = await fetch(path, { headers });

    response.headers.forEach((value, key) => {
        ctx.set(key, value);
    });

    ctx.status = response.status;
    ctx.body = Readable.fromWeb(response.body as any);
};

export default proxySound;
