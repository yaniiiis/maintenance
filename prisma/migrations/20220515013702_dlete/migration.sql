-- DropForeignKey
ALTER TABLE "assurances" DROP CONSTRAINT "assurances_user_id_fkey";

-- DropForeignKey
ALTER TABLE "fournisseurs" DROP CONSTRAINT "fournisseurs_user_id_fkey";

-- DropForeignKey
ALTER TABLE "mecaniciens" DROP CONSTRAINT "mecaniciens_user_id_fkey";

-- DropForeignKey
ALTER TABLE "pieces" DROP CONSTRAINT "pieces_user_id_fkey";

-- DropForeignKey
ALTER TABLE "vehicules" DROP CONSTRAINT "vehicules_user_id_fkey";

-- DropIndex
DROP INDEX "vehicules_id_key";

-- AddForeignKey
ALTER TABLE "vehicules" ADD CONSTRAINT "vehicules_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assurances" ADD CONSTRAINT "assurances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fournisseurs" ADD CONSTRAINT "fournisseurs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pieces" ADD CONSTRAINT "pieces_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mecaniciens" ADD CONSTRAINT "mecaniciens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
