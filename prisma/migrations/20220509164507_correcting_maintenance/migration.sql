/*
  Warnings:

  - You are about to drop the `maintenances` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "maintenance_pieces" DROP CONSTRAINT "maintenance_pieces_maintenance_id_fkey";

-- DropForeignKey
ALTER TABLE "maintenances" DROP CONSTRAINT "maintenances_type_id_fkey";

-- DropForeignKey
ALTER TABLE "maintenances" DROP CONSTRAINT "maintenances_vehicule_id_fkey";

-- DropTable
DROP TABLE "maintenances";

-- CreateTable
CREATE TABLE "maintenance" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(255) NOT NULL,
    "vehicule_id" INTEGER NOT NULL,
    "type_id" INTEGER NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "cout" DECIMAL(65,30) NOT NULL,
    "fichier" VARCHAR(255) NOT NULL,

    CONSTRAINT "maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "maintenance_id_key" ON "maintenance"("id");

-- AddForeignKey
ALTER TABLE "maintenance" ADD CONSTRAINT "maintenance_vehicule_id_fkey" FOREIGN KEY ("vehicule_id") REFERENCES "vehicules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance" ADD CONSTRAINT "maintenance_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "type_de_maintenance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_pieces" ADD CONSTRAINT "maintenance_pieces_maintenance_id_fkey" FOREIGN KEY ("maintenance_id") REFERENCES "maintenance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
