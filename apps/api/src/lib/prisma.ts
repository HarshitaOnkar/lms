import { PrismaClient } from "@prisma/client";

// Prevent creating multiple Prisma clients in dev (hot reload).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const client = new PrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

