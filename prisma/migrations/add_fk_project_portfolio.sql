-- Añadir la clave foránea a ProjectPortfolioItem.
-- Usa este script si tu BD usa collation por defecto MySQL 8 (utf8mb4_0900_ai_ci).
-- Si falla con errno 150, ejecuta en su lugar: add_fk_project_portfolio_unicode_ci.sql

ALTER TABLE `ProjectPortfolioItem`
  MODIFY `projectId` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL;

ALTER TABLE `ProjectPortfolioItem`
  ADD CONSTRAINT `ProjectPortfolioItem_projectId_fkey`
  FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
