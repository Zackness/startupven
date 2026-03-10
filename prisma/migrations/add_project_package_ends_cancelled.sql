-- ProjectPackage: fechas de fin y cancelación para renovación y estado
ALTER TABLE `ProjectPackage` ADD COLUMN `endsAt` DATETIME(3) NULL;
ALTER TABLE `ProjectPackage` ADD COLUMN `cancelledAt` DATETIME(3) NULL;
