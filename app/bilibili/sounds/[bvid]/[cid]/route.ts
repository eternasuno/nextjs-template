import { getVideoPath } from '@/lib/bilibili';
import { withSound } from '@/lib/middlewares';

export const GET = withSound<{ params: { bvid: string; cid: string } }>(
    (request, { params: { bvid, cid } }) => {
        return getVideoPath(bvid, cid);
    }
);
