/*
  Warnings:

  - Added the required column `mecanicien_id` to the `maintenances` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "maintenances" ADD COLUMN     "mecanicien_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_mecanicien_id_fkey" FOREIGN KEY ("mecanicien_id") REFERENCES "mecaniciens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
