import { z } from 'zod';
import { insertRequestSchema, insertUserSchema, requests, users } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users' as const,
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/users/:id' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  requests: {
    list: {
      method: 'GET' as const,
      path: '/api/requests' as const,
      input: z.object({
        role: z.string().optional(),
        userId: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof requests.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/requests' as const,
      input: insertRequestSchema,
      responses: {
        201: z.custom<typeof requests.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/requests/:id' as const,
      input: insertRequestSchema.partial(),
      responses: {
        200: z.custom<typeof requests.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
