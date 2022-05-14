-- DropForeignKey
ALTER TABLE "maintenances" DROP CONSTRAINT "maintenances_user_id_fkey";

-- AddForeignKey
ALTER TABLE "maintenances" ADD CONSTRAINT "maintenances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
