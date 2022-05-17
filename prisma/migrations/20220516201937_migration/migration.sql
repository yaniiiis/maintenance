/*
  Warnings:

  - You are about to alter the column `cout` on the `maintenances` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "maintenances" ALTER COLUMN "cout" SET DATA TYPE DOUBLE PRECISION;
