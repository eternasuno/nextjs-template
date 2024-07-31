import { loadSync } from '@std/dotenv';

loadSync({ envPath: '.env', export: true });

loadSync({ envPath: '.env.local', export: true });
