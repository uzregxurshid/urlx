-- CreateEnum
CREATE TYPE "public"."Device" AS ENUM ('DESKTOP', 'MOBILE', 'TABLET', 'BOT', 'OTHER');

-- AlterTable
ALTER TABLE "public"."Click" ADD COLUMN     "browser" TEXT,
ADD COLUMN     "device" "public"."Device",
ADD COLUMN     "os" TEXT;

-- CreateIndex
CREATE INDEX "Click_linkId_device_idx" ON "public"."Click"("linkId", "device");

-- CreateIndex
CREATE INDEX "Click_linkId_country_idx" ON "public"."Click"("linkId", "country");

-- CreateIndex
CREATE INDEX "Click_linkId_isBot_ts_idx" ON "public"."Click"("linkId", "isBot", "ts");

-- CreateIndex
CREATE INDEX "Link_userId_createdAt_idx" ON "public"."Link"("userId", "createdAt");
