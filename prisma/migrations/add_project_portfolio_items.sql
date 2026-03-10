-- Portfolio items for projects (Instagram, Behance, image, video links)
-- MySQL: ejecutar con npx prisma db execute --file prisma/migrations/add_project_portfolio_items.sql
-- Después, para añadir la clave foránea (misma collation que Project): 
--   npx prisma db execute --file prisma/migrations/add_fk_project_portfolio_unicode_ci.sql

CREATE TABLE IF NOT EXISTS `ProjectPortfolioItem` (
  `id` VARCHAR(191) NOT NULL,
  `projectId` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `url` VARCHAR(2048) NOT NULL,
  `orden` INT NOT NULL DEFAULT 0,
  `caption` VARCHAR(512) NULL,
  PRIMARY KEY (`id`),
  INDEX `ProjectPortfolioItem_projectId_idx` (`projectId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
