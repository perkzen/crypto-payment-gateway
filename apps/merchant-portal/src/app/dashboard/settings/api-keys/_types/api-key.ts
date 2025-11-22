import { listApiKeysOptions } from '../_hooks/queries';

type ListApiKeysQueryFn = typeof listApiKeysOptions.queryFn;

export type ApiKey = NonNullable<
  Awaited<ReturnType<NonNullable<ListApiKeysQueryFn>>>
>[number];
