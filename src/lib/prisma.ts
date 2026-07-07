import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST || "localhost",
    port: Number(process.env.DATABASE_PORT || 3306),
    user: process.env.DATABASE_USER || "root",
    password: process.env.DATABASE_PASSWORD || "root",
    database: process.env.DATABASE_NAME || "vibematch",
    connectionLimit: 10,
    connectTimeout: 5000,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
