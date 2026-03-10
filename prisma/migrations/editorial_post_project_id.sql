-- EditorialPost: calendario por proyecto (projectId opcional, userId opcional)
-- MySQL: npx prisma db execute --file prisma/migrations/editorial_post_project_id.sql

-- Hacer userId nullable (calendario puede ser por proyecto solamente)
ALTER TABLE `EditorialPost` MODIFY COLUMN `userId` VARCHAR(191) NULL;

-- Añadir projectId y relación con Project
ALTER TABLE `EditorialPost` ADD COLUMN `projectId` VARCHAR(191) NULL;
CREATE INDEX `EditorialPost_projectId_date_idx` ON `EditorialPost`(`projectId`, `date`);
ALTER TABLE `EditorialPost` ADD CONSTRAINT `EditorialPost_projectId_fkey`
  FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
