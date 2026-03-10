-- Tabla de asignación proyecto–usuario (varios clientes por proyecto)
-- MySQL: npx prisma db execute --file prisma/migrations/add_project_user.sql

CREATE TABLE IF NOT EXISTS `ProjectUser` (
  `projectId` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`projectId`, `userId`),
  INDEX `ProjectUser_userId_idx` (`userId`),
  CONSTRAINT `ProjectUser_projectId_fkey`
    FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `ProjectUser_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
