/*
  Warnings:

  - A unique constraint covering the columns `[token,type]` on the table `Confirmation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Confirmation_token_key";

-- CreateIndex
CREATE UNIQUE INDEX "Confirmation_token_type_key" ON "Confirmation"("token", "type");
