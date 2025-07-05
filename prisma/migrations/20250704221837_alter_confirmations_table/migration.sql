/*
  Warnings:

  - Added the required column `expiry` to the `Confirmation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Confirmation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ConfirmationType" AS ENUM ('PASSWORD_RESET', 'EMAIL_VERIFICATION');

-- DropIndex
DROP INDEX "Confirmation_userId_key";

-- AlterTable
ALTER TABLE "Confirmation" ADD COLUMN     "expiry" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "type" "ConfirmationType" NOT NULL,
ADD COLUMN     "used" BOOLEAN NOT NULL DEFAULT false;
