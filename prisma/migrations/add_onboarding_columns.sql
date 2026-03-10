-- Añadir columnas para onboarding de clientes (ejecutar si no usas migrate dev)
-- MySQL: IF NOT EXISTS en ALTER ADD COLUMN no existe en todas las versiones; si falla, quita la columna del script si ya existe.
ALTER TABLE `User` ADD COLUMN `telefono` VARCHAR(32) NULL;
ALTER TABLE `User` ADD COLUMN `onboardingCompletedAt` DATETIME(3) NULL;
