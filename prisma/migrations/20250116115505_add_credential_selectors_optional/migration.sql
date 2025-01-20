/*
  Warnings:

  - A unique constraint covering the columns `[userId,websiteUrl]` on the table `Credential` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Credential" ADD COLUMN     "passwordSelector" TEXT,
ADD COLUMN     "submitSelector" TEXT,
ADD COLUMN     "usernameSelector" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Credential_userId_websiteUrl_key" ON "Credential"("userId", "websiteUrl");
