import { type createApiKeyOptions } from '../_hooks/mutations';
import { type listApiKeysOptions } from '../_hooks/queries';

type ListApiKeysQueryFn = typeof listApiKeysOptions.queryFn;

export type ApiKey = NonNullable<
  Awaited<ReturnType<NonNullable<ListApiKeysQueryFn>>>
>[number];

type CreateApiKeyMutationFn = typeof createApiKeyOptions.mutationFn;

export type CreateApiKeyResult = Awaited<
  ReturnType<NonNullable<CreateApiKeyMutationFn>>
>;
