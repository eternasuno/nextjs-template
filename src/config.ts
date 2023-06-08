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

const {
    HOST_NAME,
    PORT,
    CACHE_TYPE,
    CACHE_EXPIRE,
    CACHE_LASTING_EXPIRE,
    REDIS_URI,
} = env;

const config = {
    hostname: HOST_NAME || '127.0.0.1',
    port: (PORT && parseInt(PORT)) || 3000,
    cache: {
        type: CACHE_TYPE,
        expire: CACHE_EXPIRE ? parseInt(CACHE_EXPIRE) : 300,
        lasting_expire: CACHE_LASTING_EXPIRE
            ? parseInt(CACHE_LASTING_EXPIRE)
            : 7200,
    },
    redis: {
        uri: REDIS_URI,
    },
    bilibili: {
        limit: 30,
    },
};

export default config;
