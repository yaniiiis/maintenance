-- DropForeignKey
ALTER TABLE "maintenances" DROP CONSTRAINT "maintenances_mecanicien_id_fkey";

-- DropForeignKey
ALTER TABLE "maintenances" DROP CONSTRAINT "maintenances_vehicule_id_fkey";

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_vehicule_id_fkey" FOREIGN KEY ("vehicule_id") REFERENCES "vehicules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_mecanicien_id_fkey" FOREIGN KEY ("mecanicien_id") REFERENCES "mecaniciens"("id") ON DELETE CASCADE ON UPDATE CASCADE;
