import '@/utils/env.ts';

import { PORT, TOKEN } from '@/config.ts';
import bilibili from '@/routes/bilibili.ts';
import { Hono } from '@hono/hono';
import { logger } from '@hono/hono/logger';
import { validator } from '@hono/hono/validator';
import { RetryError } from '@std/async';

const app = new Hono({ strict: false });

app.use(logger());

app.use(validator('query', (value, context) => {
  const token = value['token'];
  if (TOKEN && token !== TOKEN) {
    return context.text('Forbidden!', 403);
  }

  return value;
}));

app.onError((error, context) => {
  console.warn(error);

  if (error instanceof RetryError) {
    return context.text((error.cause as Error)?.message, 500);
  }

  return context.text(error.message, 500);
});

app.route('/bilibili', bilibili);

Deno.serve({ port: PORT }, app.fetch);
