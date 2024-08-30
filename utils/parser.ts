import {
  registerFunction,
  search,
  TYPE_NULL,
  TYPE_NUMBER,
  TYPE_STRING,
} from '@jmespath-community/jmespath';
import type { parse_options } from '@libs/xml';
import { parse } from '@libs/xml';

type JSONValue = Parameters<typeof search>[0];

registerFunction(
  'to_date',
  ([value]) =>
    value === undefined || value === null
      ? new Date().toUTCString()
      : new Date(value).toUTCString(),
  [{ types: [TYPE_NUMBER, TYPE_STRING, TYPE_NULL], optional: true }],
);

export const parseJson = <R extends JSONValue>(
  data: JSONValue,
  query: string,
) => search(data, query) as R;

export const parseXml = <R extends JSONValue>(
  xml: string,
  query: string,
  options?: parse_options,
) => parseJson<R>(parse(xml, options) as JSONValue, query);
