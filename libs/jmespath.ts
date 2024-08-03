import {
  registerFunction,
  search,
  TYPE_NULL,
  TYPE_NUMBER,
  TYPE_STRING,
} from '@jmespath-community/jmespath';

type JSONValue = Parameters<typeof search>[0];

registerFunction(
  'to_date',
  ([value]) =>
    // deno-lint-ignore no-explicit-any
    value === undefined || value === null ? new Date() : new Date(value) as any,
  [{ types: [TYPE_NUMBER, TYPE_STRING, TYPE_NULL], optional: true }],
);

export const convert = <T>(data: JSONValue, query: string) =>
  search(data, query) as unknown as T;
