-- DropForeignKey
ALTER TABLE "maintenance_pieces" DROP CONSTRAINT "maintenance_pieces_maintenance_id_fkey";

-- DropForeignKey
ALTER TABLE "maintenance_pieces" DROP CONSTRAINT "maintenance_pieces_user_id_fkey";

-- AddForeignKey
ALTER TABLE "maintenance_pieces" ADD CONSTRAINT "maintenance_pieces_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maintenance_pieces" ADD CONSTRAINT "maintenance_pieces_maintenance_id_fkey" FOREIGN KEY ("maintenance_id") REFERENCES "maintenances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
