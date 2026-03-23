import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.coerce.number().default(4000),

  DATABASE_URL: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),

  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().default(15 * 60),
  REFRESH_TOKEN_TTL_SECONDS: z.coerce.number().default(30 * 24 * 60 * 60),

  COMPLETION_GRACE_SECONDS: z.coerce.number().default(5),

  FRONTEND_ORIGIN: z.string().optional(),

  REFRESH_COOKIE_NAME: z.string().default("refresh_token"),
  REFRESH_COOKIE_SECURE: z.coerce.boolean().default(false)
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}
