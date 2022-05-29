/*
  Warnings:

  - You are about to drop the column `repare` on the `maintenances` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Etat" AS ENUM ('Avant', 'EnCours', 'Repare');

-- AlterTable
ALTER TABLE "maintenances" DROP COLUMN "repare",
ADD COLUMN     "etat" "Etat" NOT NULL DEFAULT E'EnCours';
