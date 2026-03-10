-- ProjectPackage: duración del servicio en meses (configurable)
ALTER TABLE `ProjectPackage` ADD COLUMN `durationMonths` INT NOT NULL DEFAULT 1;
