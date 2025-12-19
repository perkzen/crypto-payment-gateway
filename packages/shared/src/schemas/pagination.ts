import { z } from 'zod';
import type { ZodTypeAny } from 'zod';

/**
 * Generic pagination metadata schema
 */
export const PaginationMetaSchema = z.object({
  page: z.number().int().min(1).describe('Current page number'),
  limit: z.number().int().min(1).describe('Items per page'),
  total: z.number().int().min(0).describe('Total number of items'),
  totalPages: z.number().int().min(0).describe('Total number of pages'),
});

export type PaginationMeta = z.infer<typeof PaginationMetaSchema>;

/**
 * Creates a paginated response schema for a given item schema
 * @param itemSchema - The Zod schema for the items in the paginated response
 * @returns A paginated response schema with data and meta fields
 */
export function createPaginatedResponseSchema<T extends ZodTypeAny>(
  itemSchema: T,
) {
  return z.object({
    data: z.array(itemSchema).describe('Array of items'),
    meta: PaginationMetaSchema,
  });
}

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};
