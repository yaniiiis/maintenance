-- AlterTable
ALTER TABLE "assurances" ADD COLUMN     "user_id" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "fournisseurs" ADD COLUMN     "user_id" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "maintenance_pieces" ADD COLUMN     "user_id" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "maintenances" ADD COLUMN     "user_id" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "mecaniciens" ADD COLUMN     "user_id" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "pieces" ADD COLUMN     "user_id" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "vehicules" ADD COLUMN     "user_id" INTEGER NOT NULL DEFAULT 1;

-- AddForeignKey
ALTER TABLE "vehicules" ADD CONSTRAINT "vehicules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assurances" ADD CONSTRAINT "assurances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fournisseurs" ADD CONSTRAINT "fournisseurs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pieces" ADD CONSTRAINT "pieces_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mecaniciens" ADD CONSTRAINT "mecaniciens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_pieces" ADD CONSTRAINT "maintenance_pieces_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
