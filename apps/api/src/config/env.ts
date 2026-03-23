import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.coerce.number().default(4000),

  DATABASE_URL: z
    .string()
    .min(1)
    .refine((v) => v.startsWith("mysql://"), "DATABASE_URL must start with mysql://"),

  // Keep runtime tolerant in hosted envs where secrets may be short but present.
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),

  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().default(15 * 60),
  REFRESH_TOKEN_TTL_SECONDS: z.coerce.number().default(30 * 24 * 60 * 60),

  COMPLETION_GRACE_SECONDS: z.coerce.number().default(5),

  FRONTEND_ORIGIN: z.string().optional(),

  REFRESH_COOKIE_NAME: z.string().default("refresh_token"),
  REFRESH_COOKIE_SECURE: z.coerce.boolean().default(false)
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const raw = process.env;
  const normalized = {
    ...raw,
    DATABASE_URL: raw.DATABASE_URL ?? raw.MYSQL_URL ?? raw.DB_URL,
    JWT_ACCESS_SECRET:
      raw.JWT_ACCESS_SECRET ?? raw.JWT_SECRET ?? raw.JWT_SECRET_KEY,
    JWT_REFRESH_SECRET:
      raw.JWT_REFRESH_SECRET ??
      raw.JWT_REFRESH_TOKEN_SECRET ??
      raw.JWT_ACCESS_SECRET ??
      raw.JWT_SECRET ??
      raw.JWT_SECRET_KEY
  };

  const parsed = envSchema.safeParse(normalized);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}
