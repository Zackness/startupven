-- Ejecutar manualmente si prisma migrate dev falla por permisos del shadow database.
-- Crea la tabla Project para el portafolio web (admin/editor crean proyectos que se muestran en /proyectos).

CREATE TABLE `Project` (
  `id` VARCHAR(191) NOT NULL,
  `titulo` VARCHAR(191) NOT NULL,
  `descripcion` TEXT NOT NULL,
  `tipo` VARCHAR(191) NOT NULL,
  `año` VARCHAR(191) NOT NULL,
  `imagen` VARCHAR(191) NULL,
  `orden` INT NOT NULL DEFAULT 0,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `Project_orden_idx`(`orden`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
