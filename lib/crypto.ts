import crypto from 'node:crypto';

export const md5 = (val: string) =>
  crypto.createHash('md5').update(val).digest('hex').toString();

export const getRandomInt = (start: number, end: number) =>
  Math.floor(Math.random() * (end - start) + start);

export const getRandomItem = <T>(arr: Array<T>) => arr[getRandomInt(0, arr.length)];

export const getRandomUpperCase = (size = 8) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  return Array.from({ length: size }, () => getRandomInt(0, alphabet.length))
    .map((index) => alphabet.charAt(index))
    .join('');
};
