import Koa from 'koa';
import routers from './routers';
import config from './config';

const { hostname, port } = config;

const app = new Koa();

app.use(routers.routes()).use(routers.allowedMethods()).listen(port, hostname);

console.info(`app start at ${hostname}:${port}`);
