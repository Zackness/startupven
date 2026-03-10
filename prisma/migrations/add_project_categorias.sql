-- Añadir columna categorias (JSON) al portafolio. Ejecutar si migrate dev falla por shadow DB.
-- MySQL:
ALTER TABLE `Project` ADD COLUMN `categorias` JSON NULL;
