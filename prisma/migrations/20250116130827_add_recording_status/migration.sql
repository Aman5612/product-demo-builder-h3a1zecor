-- CreateEnum
CREATE TYPE "RecordingStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Recording" ADD COLUMN     "scriptId" INTEGER,
ADD COLUMN     "status" "RecordingStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "googleDriveUrl" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Recording" ADD CONSTRAINT "Recording_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "Script"("id") ON DELETE SET NULL ON UPDATE CASCADE;
