-- AlterTable
ALTER TABLE "users" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;
--costum part
INSERT INTO "users" VALUES (1,1)