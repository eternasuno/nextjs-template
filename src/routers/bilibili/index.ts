import Router from '@koa/router';
import podcast from './podcast';
import sounds from './sounds';

const router = new Router();

router.use('/podcast', podcast.routes()).use(podcast.allowedMethods());

router.use('/sounds', sounds.routes()).use(sounds.allowedMethods());

export default router;
