import {
  getRandomInt,
  getRandomItem,
  getRandomUpperCase,
} from '@/utils/random.ts';
import { assert, assertEquals } from '@std/assert';

Deno.test('getRandomInt test', () => {
  const result = getRandomInt(0, 10);

  assert(result >= 0 && result < 10);
});

Deno.test('getRandomItem test', () => {
  const list = [1, 2, 3, 4, 5];
  const result = getRandomItem(list);

  assert(list.includes(result));
});

Deno.test('getRandomUpperCase test', () => {
  const result = getRandomUpperCase(1);
  const charCode = result.charCodeAt(0);

  assertEquals(result.length, 1);
  assert(charCode >= 65 && charCode < 91);
});
