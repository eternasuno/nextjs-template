import { format } from '@/libs/duration.ts';
import { assertEquals, assertIsError } from '@std/assert';

Deno.test('duration format test,diration >= 0', () => {
  const result = format(0);

  assertEquals(result, '00:00:00');
});

Deno.test('duration format test,throw error when diration < 0', () => {
  try {
    format(-1);
  } catch (error) {
    assertIsError(error);
  }
});
