import * as fs from 'fs';
import path from 'path';
import { cwd, env } from 'process';
import dotenv from 'dotenv';

const { NODE_ENV } = env;
const root = fs.realpathSync(cwd());
const dotenvPath = path.resolve(root, '.env');

dotenv.config({ path: `${dotenvPath}.local` });
dotenv.config({ path: `${dotenvPath}.${NODE_ENV}` });
dotenv.config({ path: dotenvPath });

const { CACHE_TYPE, CACHE_EXPIRE, REDIS_URI } = env;

const config = {
    hostname: '127.0.0.1',
    port: 3000,
    cache: {
        type: CACHE_TYPE,
        expire: CACHE_EXPIRE ? parseInt(CACHE_EXPIRE) : 300,
    },
    redis: {
        uri: REDIS_URI,
    },
    bilibili: {
        limit: 30,
    },
};

export default config;
