import { z } from 'zod';

// Export format enum
export const exportFormatSchema = z.enum(['csv', 'xlsx']);
export type ExportFormat = z.infer<typeof exportFormatSchema>;

// Export request schema (generic, will be extended per domain)
export const baseExportRequestSchema = z.object({
  format: exportFormatSchema,
});

// Count response schema
export const countResponseSchema = z.object({
  count: z.number().int().nonnegative(),
});

export type CountResponse = z.infer<typeof countResponseSchema>;

// Paginated response helper (generic)
export interface PaginatedResponse<T> {
  opportunities: T[];
  page: number;
  pageSize: number;
}

// ID param schema
export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export type IdParam = z.infer<typeof idParamSchema>;

// External ID param schema (for energy diagnostics)
export const externalIdParamSchema = z.object({
  externalId: z.string(),
});

export type ExternalIdParam = z.infer<typeof externalIdParamSchema>;
