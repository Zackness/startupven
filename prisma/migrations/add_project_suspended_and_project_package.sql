-- Project: columna suspended para proyectos suspendidos en escritorio del cliente
ALTER TABLE `Project` ADD COLUMN `suspended` BOOLEAN NOT NULL DEFAULT false;

-- ProjectPackage: servicios (paquetes) asignados a un proyecto por el usuario
CREATE TABLE `ProjectPackage` (
  `id` VARCHAR(191) NOT NULL,
  `projectId` VARCHAR(191) NOT NULL,
  `packageId` VARCHAR(191) NOT NULL,
  `suspended` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `ProjectPackage_projectId_packageId_key` (`projectId`, `packageId`),
  INDEX `ProjectPackage_projectId_idx` (`projectId`),
  CONSTRAINT `ProjectPackage_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
