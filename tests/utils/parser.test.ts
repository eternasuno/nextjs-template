import { parseJson, parseXml } from '@/utils/parser.ts';
import { assert, assertEquals, assertIsError } from '@std/assert';

Deno.test('parse josn to_date test, number to date', () => {
  const date = parseJson({}, 'to_date(`0`)');

  assertEquals(date, new Date(0).toUTCString());
});

Deno.test('parse josn to_date test, string to date', () => {
  const date = parseJson({}, 'to_date(`"1970-01-01"`)');

  assertEquals(date, new Date('1970-01-01').toUTCString());
});

Deno.test('parse josn to_date test, null for date', () => {
  const date = parseJson({}, 'to_date(`null`)') as string;

  assert(Date.now() - new Date(date).getTime() < 1000);
});

Deno.test('parse josn to_date test, empty for date', () => {
  const date = parseJson({}, 'to_date()') as string;

  assert(Date.now() - new Date(date).getTime() < 1000);
});

Deno.test('parse josn to_date test, throw error for unexpected input', () => {
  try {
    parseJson({}, 'to_date(`[1]`)');
  } catch (error) {
    assertIsError(error);
  }
});

Deno.test('parse xml test', () => {
  const xml = `
    <?xml version="1.0" encoding="UTF-8"?>
    <title>test</title>
  `;

  const result = parseXml(xml, 'title', { clean: { attributes: true } });

  assertEquals(result, 'test');
});
