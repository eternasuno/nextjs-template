import { md5 } from '@/libs/crypto.ts';
import { assertEquals } from '@std/assert';

Deno.test('md5 test', () => {
  const excepted = '098f6bcd4621d373cade4e832627b4f6';

  assertEquals(md5('test'), excepted);
});
