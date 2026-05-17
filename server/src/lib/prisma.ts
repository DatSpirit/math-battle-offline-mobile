// lib/prisma.ts — Shared PrismaClient instance
// Prisma v7: requires driver adapter for database connection
// Dùng chung cho tất cả services, tránh tạo nhiều connection

import 'dotenv/config';
import { PrismaClient } from '.prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

// Resolve database path relative to server/prisma/dev.db
const dbPath = process.env.DATABASE_URL?.replace('file:', '').replace(/"/g, '') || './prisma/dev.db';
const absoluteDbPath = path.resolve(__dirname, '../../', dbPath);

const adapter = new PrismaBetterSqlite3({
  url: `file:${absoluteDbPath}`,
});

// Type assertion: adapter option confuses TS generic inference,
// but model accessors (user, pvpRoom, order) exist correctly at runtime.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const prisma = new PrismaClient({ adapter } as any) as PrismaClient;
