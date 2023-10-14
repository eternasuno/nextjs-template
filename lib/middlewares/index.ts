import { type NextRequest } from 'next/server';

// eslint-disable-next-line no-unused-vars
export type Handle<T, R> = (request: NextRequest, ctx: T) => R | Promise<R>;

export * from './with-podcast';
export * from './with-sound';
