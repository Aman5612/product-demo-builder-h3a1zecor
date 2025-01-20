/*
  Warnings:

  - Made the column `passwordSelector` on table `Credential` required. This step will fail if there are existing NULL values in that column.
  - Made the column `submitSelector` on table `Credential` required. This step will fail if there are existing NULL values in that column.
  - Made the column `usernameSelector` on table `Credential` required. This step will fail if there are existing NULL values in that column.

*/
-- Set default values for existing records
UPDATE "Credential" SET 
  "usernameSelector" = 'input[name="username"]',
  "passwordSelector" = 'input[name="password"]', 
  "submitSelector" = 'button[type="submit"]'
WHERE "usernameSelector" IS NULL OR "passwordSelector" IS NULL OR "submitSelector" IS NULL;

-- AlterTable
ALTER TABLE "Credential" ALTER COLUMN "passwordSelector" SET NOT NULL,
ALTER COLUMN "submitSelector" SET NOT NULL,
ALTER COLUMN "usernameSelector" SET NOT NULL;
