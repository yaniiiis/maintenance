/*
  Warnings:

  - Added the required column `type2` to the `maintenances` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Type2" AS ENUM ('Curative', 'Preventive');

-- AlterTable
ALTER TABLE "maintenances" ADD COLUMN     "type2" "Type2" NOT NULL;
