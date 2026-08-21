import { z } from "zod";

const environmentSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_PORT: z.coerce.number().int().positive().default(3001),
  SESSION_TTL_HOURS: z.coerce.number().int().positive().max(24 * 30).default(24),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_COMMAND_MODEL: z.string().min(1).default("gpt-5"),
});

export const environment = environmentSchema.parse(process.env);
