import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { env } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Build the libSQL adapter from env.
 *
 * Local dev: DATABASE_URL is something like `file:./dev.db`, no auth token.
 * Production (Turso): DATABASE_URL is `libsql://...` and DATABASE_AUTH_TOKEN
 * is required.
 */
function createPrismaClient() {
  const adapter = new PrismaLibSql({
    url: env.DATABASE_URL,
    // libSQL ignores authToken when targeting a `file:` URL, so it's safe to
    // pass unconditionally — but keep the conditional to make intent clear.
    ...(env.DATABASE_AUTH_TOKEN
      ? { authToken: env.DATABASE_AUTH_TOKEN }
      : {}),
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
