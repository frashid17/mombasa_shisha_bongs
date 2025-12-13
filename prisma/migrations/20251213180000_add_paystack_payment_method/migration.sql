-- AlterTable: Add PAYSTACK to PaymentMethod enum
-- Note: MySQL doesn't support adding enum values directly, so we need to alter the column

ALTER TABLE `payments` MODIFY COLUMN `method` ENUM('MPESA', 'PAYSTACK', 'CARD', 'BANK_TRANSFER', 'CASH_ON_DELIVERY') NOT NULL;

-- Add Paystack-specific columns
ALTER TABLE `payments` ADD COLUMN `paystackReference` VARCHAR(191) NULL,
ADD COLUMN `paystackAuthorizationCode` VARCHAR(191) NULL,
ADD COLUMN `paystackCustomerCode` VARCHAR(191) NULL,
ADD COLUMN `paystackChannel` VARCHAR(191) NULL;

-- Add unique index on paystackReference
CREATE UNIQUE INDEX `payments_paystackReference_key` ON `payments`(`paystackReference`);

-- Add index on paystackReference for faster lookups
CREATE INDEX `payments_paystackReference_idx` ON `payments`(`paystackReference`);

