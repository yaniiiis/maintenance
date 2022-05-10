-- CreateTable
CREATE TABLE "vehicules" (
    "id" SERIAL NOT NULL,
    "traqueur" VARCHAR(255) NOT NULL,
    "nom" VARCHAR(255) NOT NULL,
    "immatriculation" VARCHAR(255) NOT NULL,
    "numero_chassis" VARCHAR(255) NOT NULL,
    "carburant" TEXT[],
    "photo" VARCHAR(255) NOT NULL,

    CONSTRAINT "vehicules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assurances" (
    "id" SERIAL NOT NULL,
    "numero_police" VARCHAR(255) NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "vehicule_id" INTEGER NOT NULL,

    CONSTRAINT "assurances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicules_id_key" ON "vehicules"("id");

-- CreateIndex
CREATE UNIQUE INDEX "assurances_id_key" ON "assurances"("id");

-- AddForeignKey
ALTER TABLE "assurances" ADD CONSTRAINT "assurances_vehicule_id_fkey" FOREIGN KEY ("vehicule_id") REFERENCES "vehicules"("id") ON DELETE CASCADE ON UPDATE CASCADE;
