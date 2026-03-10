-- Cache del payload "crear proyecto" de escritorio para recuperar al volver de Stripe.
CREATE TABLE IF NOT EXISTS `StripeEscritorioPayload` (
  `paymentIntentId` VARCHAR(191) NOT NULL,
  `payload` JSON NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`paymentIntentId`),
  INDEX `StripeEscritorioPayload_userId_idx`(`userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
