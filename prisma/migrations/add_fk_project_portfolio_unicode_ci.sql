-- Alternativa si add_fk_project_portfolio.sql falla con errno 150:
-- Prueba esta collation (utf8mb4_unicode_ci, típica en Prisma).
-- Solo ejecuta UNO de los dos: add_fk o add_fk_project_portfolio_unicode_ci.

ALTER TABLE `ProjectPortfolioItem`
  MODIFY `projectId` VARCHAR(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;

ALTER TABLE `ProjectPortfolioItem`
  ADD CONSTRAINT `ProjectPortfolioItem_projectId_fkey`
  FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
