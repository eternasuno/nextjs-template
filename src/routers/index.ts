import Router from '@koa/router';
import bilibili from './bilibili';

const router = new Router();

router.use('/bilibili', bilibili.routes()).use(bilibili.allowedMethods());

export default router;
