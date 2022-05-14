/*
  Warnings:

  - A unique constraint covering the columns `[vehicule_id]` on the table `assurances` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "assurances_vehicule_id_key" ON "assurances"("vehicule_id");
