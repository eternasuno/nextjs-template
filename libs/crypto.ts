import crypto from 'node:crypto';

export const md5 = (val: string) =>
  crypto.createHash('md5').update(val).digest('hex').toString();
