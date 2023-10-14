import { NextResponse } from 'next/server';
import { Handle } from '.';
import cache from '../cache';
import { md5 } from '../crypto';

export const withSound =
    <T>(handle: Handle<T, string>): Handle<T, Response> =>
    async (request, ctx) => {
        const url = await cache.wrap(md5(request.url), async () =>
            handle(request, ctx)
        );

        return NextResponse.redirect(url, {
            status: 302,
        });
    };
