import { convert } from '@/libs/jmespath.ts';
import { assert, assertEquals, assertIsError } from '@std/assert';

Deno.test('object convert to_date test, number to date', () => {
  const date = convert<Date>({}, 'to_date(`0`)');

  assertEquals(date, new Date(0));
});

Deno.test('object convert to_date test, string to date', () => {
  const date = convert<Date>({}, 'to_date(`"1970-01-01"`)');

  assertEquals(date, new Date('1970-01-01'));
});

Deno.test('object convert to_date test, null for date', () => {
  const date = convert<Date>({}, 'to_date(`null`)');

  assert(Date.now() - date.getTime() < 100);
});

Deno.test('object convert to_date test, empty for date', () => {
  const date = convert<Date>({}, 'to_date()');

  assert(Date.now() - date.getTime() < 100);
});

Deno.test('object convert to_date test, throw error for unexpected input', () => {
  try {
    convert<Date>({}, 'to_date(`[1]`)');
  } catch (error) {
    assertIsError(error);
  }
});
