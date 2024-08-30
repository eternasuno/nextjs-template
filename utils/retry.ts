import { retry as stdRetry } from '@std/async';
import type { RetryOptions } from '@std/async';

export const retry = <T extends unknown[], R>(
  func: (...args: T) => R | Promise<R>,
  opts?: RetryOptions,
) =>
(...args: T) => stdRetry(() => func(...args), opts) as Promise<R>;
