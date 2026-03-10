-- Add public flag to Project (portfolio). Default true so existing projects stay visible.
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "public" BOOLEAN NOT NULL DEFAULT true;
