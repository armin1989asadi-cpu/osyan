import { z } from 'zod';
import { insertPromptSchema, prompts } from './schema';

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
  prompts: {
    generate: {
      method: 'POST' as const,
      path: '/api/generate',
      input: z.object({
        persona: z.enum(['Gemini', 'GPT-4', 'Grok', 'Claude', 'Architect']),
        idea: z.string().min(1, "Input idea is required"),
      }),
      responses: {
        200: z.custom<typeof prompts.$inferSelect>(),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/history',
      responses: {
        200: z.array(z.custom<typeof prompts.$inferSelect>()),
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

export type GenerateInput = z.infer<typeof api.prompts.generate.input>;
