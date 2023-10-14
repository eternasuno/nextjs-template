import { NextResponse } from 'next/server';
import { Handle } from '.';
import cache from '../cache';
import { md5 } from '../crypto';
import { Feed, buildXml } from '../podcast';

export const withPodcast =
    <T>(handle: Handle<T, Feed>): Handle<T, NextResponse> =>
    async (request, ctx) => {
        const xml = await cache.wrap(md5(request.url), async () =>
            buildXml(await handle(request, ctx))
        );

        return new NextResponse<string>(xml, {
            headers: {
                'Content-Type': 'text/xml',
            },
        });
    };
