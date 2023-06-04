import Router from '@koa/router';
import podcast from './podcast';
import sounds from './sounds';

const router = new Router();

router.use('/podcast', podcast.routes(), sounds.allowedMethods());

router.use('/sounds', sounds.routes(), sounds.allowedMethods());

export default router;
