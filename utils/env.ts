import { loadSync } from '@std/dotenv';

loadSync({ envPath: '.env.local', export: true });

loadSync({ envPath: '.env', export: true });
