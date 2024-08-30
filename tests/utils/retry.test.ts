import { retry } from '@/utils/retry.ts';
import { assertEquals, assertIsError } from '@std/assert';
import { RetryError } from '@std/async';

Deno.test('retry test, retry when given function throws', async () => {
  let attempt = 0;

  await (retry(
    () => {
      attempt += 1;

      if (attempt > 1) {
        return attempt;
      } else {
        throw new Error();
      }
    },
    { maxTimeout: 500, minTimeout: 100, multiplier: 1 },
  ))();

  assertEquals(attempt, 2);
});

Deno.test('retry test, throw error when attempts are exhausted', async () => {
  try {
    await (retry(() => {
      throw new Error();
    }, { maxAttempts: 1 }))();
  } catch (error) {
    assertIsError(error, RetryError);
  }
});
