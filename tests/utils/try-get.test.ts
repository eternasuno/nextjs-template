import { tryGet } from '@/utils/try-get.ts';
import { assertEquals } from '@std/assert';
import { delay } from '@std/async';

Deno.test('tryGet test', async (test) => {
  let count = 0;

  await test.step('return func result when not hit', async () => {
    const result = await tryGet(() => count += 1, ['test'], 500, false, true)();

    assertEquals(result, 1);
  });

  await test.step('return cache when hit', async () => {
    const result = await tryGet(() => count += 1, ['test'], 500, false, true)();

    assertEquals(result, 1);
  });

  await test.step('return func result when cache expired', async () => {
    await delay(500);
    const result = await tryGet(() => count += 1, ['test'], 500, false, true)();

    assertEquals(result, 2);
  });

  await test.step('refresh cache', async () => {
    await delay(250);
    await tryGet(() => count += 1, ['test'], 500, true, true)();
    await delay(250);
    const result = await tryGet(() => count += 1, ['test'], 500, true, true)();

    assertEquals(result, 2);
  });

  await test.step('cache expired when refresh is false', async () => {
    await delay(250);
    await tryGet(() => count += 1, ['test'], 500, false)();
    await delay(250);
    const result = await tryGet(() => count += 1, ['test'], 500, false, true)();

    assertEquals(result, 3);
  });
});
