import Router from '@koa/router';
import { getVideoPath } from '../../lib/bilibili';
import proxySound from '../../middleware/proxy-sound';

const router = new Router();

router.use(proxySound());

router.get('/videos/:bvid/:cid', (ctx) => {
    const {
        params: { bvid, cid },
    } = ctx;

    return getVideoPath(bvid, cid);
});

export default router;
