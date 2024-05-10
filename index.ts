import 'https://deno.land/std@0.224.0/dotenv/load.ts';
import { Hono } from 'https://deno.land/x/hono@v4.3.3/mod.ts';
import { logger } from 'https://deno.land/x/hono@v4.3.3/middleware.ts';
import bilibili from './routes/bilibili.ts';

const app = new Hono({ strict: false });

app.use(logger());

app.onError((error, context) => {
  console.warn(error);
  return context.text(error.message, 500);
});

app.route('/bilibili', bilibili);

Deno.serve(app.fetch);
