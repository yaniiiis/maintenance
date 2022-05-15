/*
  Warnings:

  - Added the required column `quantite` to the `maintenance_pieces` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "maintenance_pieces" ADD COLUMN     "quantite" INTEGER NOT NULL;
