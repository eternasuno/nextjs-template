import crypto from 'node:crypto';

export const md5 = (val: string) =>
  crypto.createHash('md5').update(val).digest('hex').toString();

export const randomUpperCase = (size = 8) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  return Array.from({ length: size }, () => Math.floor(Math.random() * alphabet.length))
    .map((index) => alphabet.charAt(index))
    .join('');
};
