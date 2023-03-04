import { getVideoPath } from '@/lib/bilibili';
import { NextResponse, type NextRequest } from 'next/server';

export const config = {
    runtime: 'edge',
};

const handle = async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const bvid = searchParams.get('bvid')!;

    try {
        const path = await getVideoPath(bvid);

        return await fetch(path, { headers: request.headers });
    } catch (error: any) {
        console.warn('Internal Server Error', error);
        return new NextResponse(JSON.stringify({ message: error.message }), {
            status: 500,
            statusText: 'Internal Server Error',
        });
    }
};

export default handle;
