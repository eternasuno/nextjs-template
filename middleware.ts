import { NextRequest, NextResponse } from 'next/server';

export const config = {
    matcher: '/api/bilibili/(.*)',
};

export const middleware = (request: NextRequest) => {
    request.headers.set('referer', 'https://www.bilibili.com');
    request.headers.delete('host');

    const response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    response.headers.set('content-type', 'audio/mpeg');

    return response;
};
