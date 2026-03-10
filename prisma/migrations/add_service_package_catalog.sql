-- Catálogo de paquetes/servicios para CRUD en admin
CREATE TABLE `ServicePackageCatalog` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `category` VARCHAR(191) NOT NULL,
  `description` TEXT NULL,
  `orden` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `ServicePackageCatalog_category_idx` (`category`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
