import config from '../config';
import memory from './memory';
import redis from './redis';

export default config.cache.type === 'redis' ? await redis() : await memory();
