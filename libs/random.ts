export const getRandomInt = (start: number, end: number) =>
  Math.floor(Math.random() * (end - start) + start);

export const getRandomItem = <T>(arr: Array<T>) => arr[getRandomInt(0, arr.length)];

export const getRandomUpperCase = (length = 8) =>
  String.fromCharCode(...Array.from({ length }, () => getRandomInt(65, 91)));
