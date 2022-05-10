/*
  Warnings:

  - You are about to drop the `Maintenace` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Maintenace_Piece` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TypeMaintenance` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Maintenace" DROP CONSTRAINT "Maintenace_type_id_fkey";

-- DropForeignKey
ALTER TABLE "Maintenace" DROP CONSTRAINT "Maintenace_vehicule_id_fkey";

-- DropForeignKey
ALTER TABLE "Maintenace_Piece" DROP CONSTRAINT "Maintenace_Piece_maintenance_id_fkey";

-- DropForeignKey
ALTER TABLE "Maintenace_Piece" DROP CONSTRAINT "Maintenace_Piece_piece_id_fkey";

-- DropTable
DROP TABLE "Maintenace";

-- DropTable
DROP TABLE "Maintenace_Piece";

-- DropTable
DROP TABLE "TypeMaintenance";

-- CreateTable
CREATE TABLE "maintenances" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(255) NOT NULL,
    "vehicule_id" INTEGER NOT NULL,
    "type_id" INTEGER NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "cout" DECIMAL(65,30) NOT NULL,
    "fichier" VARCHAR(255) NOT NULL,

    CONSTRAINT "maintenances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "type_de_maintenance" (
    "id" SERIAL NOT NULL,
    "type" VARCHAR(255) NOT NULL,

    CONSTRAINT "type_de_maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maintenance_pieces" (
    "maintenance_id" INTEGER NOT NULL,
    "piece_id" INTEGER NOT NULL,

    CONSTRAINT "maintenance_pieces_pkey" PRIMARY KEY ("maintenance_id","piece_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "maintenances_id_key" ON "maintenances"("id");

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_vehicule_id_fkey" FOREIGN KEY ("vehicule_id") REFERENCES "vehicules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "type_de_maintenance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_pieces" ADD CONSTRAINT "maintenance_pieces_piece_id_fkey" FOREIGN KEY ("piece_id") REFERENCES "pieces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_pieces" ADD CONSTRAINT "maintenance_pieces_maintenance_id_fkey" FOREIGN KEY ("maintenance_id") REFERENCES "maintenances"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
