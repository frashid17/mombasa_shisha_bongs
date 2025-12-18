-- AlterTable
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "scheduledDelivery" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "orders_scheduledDelivery_idx" ON "orders"("scheduledDelivery");

