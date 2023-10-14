import { NextResponse } from 'next/server';
import { Handle } from '.';
import cache from '../cache';
import { md5 } from '../crypto';

export const withSound =
    <T>(handle: Handle<T, string>): Handle<T, Response> =>
    async (request, ctx) => {
        const url = await cache.wrap(
            md5(request.url),
            async () => handle(request, ctx),
            // url will expire after 2 hours
            2 * 60 * 60 * 1000
        );

        return NextResponse.redirect(url, {
            status: 302,
        });
    };
