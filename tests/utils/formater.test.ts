import { formatDuration } from '@/utils/formater.ts';
import { assertEquals, assertIsError } from '@std/assert';

Deno.test('duration format test,diration >= 0', () => {
  const result = formatDuration(0);

  assertEquals(result, '00:00:00');
});

Deno.test('duration format test,throw error when diration < 0', () => {
  try {
    formatDuration(-1);
  } catch (error) {
    assertIsError(error);
  }
});
