import { Middleware } from 'koa';
import tryGet from '../lib/cache';
import { Readable } from 'stream';

const proxySound = (): Middleware => async (ctx, next) => {
    const { url, header } = ctx;
    const path = await tryGet(url, next);

    const headers = new Headers();
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

    ctx.type = response.headers.get('content-type') || 'audio/mp4';
    ctx.status = response.status;
    ctx.body = Readable.fromWeb(response.body as any);
};

export default proxySound;
