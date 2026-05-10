-- AlterTable
-- Use double-quoted "products" and "isSoldOut" so the column name matches Prisma (camelCase).
-- In Supabase SQL Editor, paste this exact statement (unquoted identifiers become lowercase and break Prisma).
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "isSoldOut" BOOLEAN NOT NULL DEFAULT false;
