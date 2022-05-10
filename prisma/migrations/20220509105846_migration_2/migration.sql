-- CreateTable
CREATE TABLE "fournisseurs" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(255) NOT NULL,
    "prenom" VARCHAR(255) NOT NULL,
    "nom_entreprise" VARCHAR(255) NOT NULL,
    "numero_tel" VARCHAR(10) NOT NULL,
    "adresse" VARCHAR(255) NOT NULL,
    "description" VARCHAR(500) NOT NULL,

    CONSTRAINT "fournisseurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pieces" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(255) NOT NULL,
    "quantite" INTEGER NOT NULL,
    "fournisseur_id" INTEGER NOT NULL,

    CONSTRAINT "pieces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mecaniciens" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(255) NOT NULL,
    "prenom" VARCHAR(255) NOT NULL,
    "nom_entreprise" VARCHAR(255) NOT NULL,
    "numero_tel" VARCHAR(10) NOT NULL,
    "adresse" VARCHAR(255) NOT NULL,
    "description" VARCHAR(500) NOT NULL,

    CONSTRAINT "mecaniciens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maintenace" (
    "id" SERIAL NOT NULL,
    "nom" VARCHAR(255) NOT NULL,
    "vehicule_id" INTEGER NOT NULL,
    "type_id" INTEGER NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "cout" DECIMAL(65,30) NOT NULL,
    "fichier" VARCHAR(255) NOT NULL,

    CONSTRAINT "Maintenace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeMaintenance" (
    "id" SERIAL NOT NULL,
    "type" VARCHAR(255) NOT NULL,

    CONSTRAINT "TypeMaintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maintenace_Piece" (
    "maintenance_id" INTEGER NOT NULL,
    "piece_id" INTEGER NOT NULL,

    CONSTRAINT "Maintenace_Piece_pkey" PRIMARY KEY ("maintenance_id","piece_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "fournisseurs_id_key" ON "fournisseurs"("id");

-- CreateIndex
CREATE UNIQUE INDEX "pieces_id_key" ON "pieces"("id");

-- CreateIndex
CREATE UNIQUE INDEX "pieces_nom_key" ON "pieces"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "mecaniciens_id_key" ON "mecaniciens"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Maintenace_id_key" ON "Maintenace"("id");

-- AddForeignKey
ALTER TABLE "pieces" ADD CONSTRAINT "pieces_fournisseur_id_fkey" FOREIGN KEY ("fournisseur_id") REFERENCES "fournisseurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenace" ADD CONSTRAINT "Maintenace_vehicule_id_fkey" FOREIGN KEY ("vehicule_id") REFERENCES "vehicules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenace" ADD CONSTRAINT "Maintenace_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "TypeMaintenance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenace_Piece" ADD CONSTRAINT "Maintenace_Piece_piece_id_fkey" FOREIGN KEY ("piece_id") REFERENCES "pieces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenace_Piece" ADD CONSTRAINT "Maintenace_Piece_maintenance_id_fkey" FOREIGN KEY ("maintenance_id") REFERENCES "Maintenace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
