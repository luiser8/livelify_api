-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "haveMoreQuestions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tip" TEXT;
