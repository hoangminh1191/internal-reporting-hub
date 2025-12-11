-- Database Initialization Script for Internal Reporting Hub (MySQL)

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Create Tables based on Prisma Schema

-- Table: Department
CREATE TABLE IF NOT EXISTS `Department` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table: User
CREATE TABLE IF NOT EXISTS `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `departmentId` VARCHAR(191) NOT NULL,
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`),
    CONSTRAINT `User_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table: ReportDefinition
CREATE TABLE IF NOT EXISTS `ReportDefinition` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `periodType` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `structure` TEXT NOT NULL,
    UNIQUE INDEX `ReportDefinition_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Table: ReportSubmission
CREATE TABLE IF NOT EXISTS `ReportSubmission` (
    `id` VARCHAR(191) NOT NULL,
    `reportDefinitionId` VARCHAR(191) NOT NULL,
    `departmentId` VARCHAR(191) NOT NULL,
    `departmentName` VARCHAR(191) NULL,
    `submittedBy` VARCHAR(191) NOT NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `periodStart` DATETIME(3) NOT NULL,
    `periodEnd` DATETIME(3) NOT NULL,
    `data` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `version` INTEGER NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `ReportSubmission_reportDefinitionId_fkey` FOREIGN KEY (`reportDefinitionId`) REFERENCES `ReportDefinition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `ReportSubmission_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 2. Seed Initial Data

-- Seed Departments
INSERT INTO `Department` (`id`, `name`, `code`) VALUES
('d1', 'Vận hành (Operations)', 'OPS'),
('d2', 'Kỹ thuật (Engineering)', 'ENG'),
('d3', 'Nhân sự (HR)', 'HR')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `code`=VALUES(`code`);

-- Seed Users
-- Password '123'
INSERT INTO `User` (`id`, `name`, `email`, `role`, `departmentId`, `password`, `avatarUrl`) VALUES
('u1', 'Nguyễn Văn A', 'a.nguyen@company.com', 'DEPARTMENT_LEAD', 'd1', '123', 'https://ui-avatars.com/api/?name=Nguy%E1%BB%85n%20V%C4%83n%20A'),
('u2', 'Trần Thị B', 'b.tran@company.com', 'DEPARTMENT_LEAD', 'd2', '123', 'https://ui-avatars.com/api/?name=Tr%E1%BA%A7n%20Th%E1%BB%8B%20B'),
('u3', 'Admin User', 'admin@company.com', 'ADMIN', 'd3', '123456', 'https://ui-avatars.com/api/?name=Admin%20User'),
('u4', 'Lê Văn C', 'c.le@company.com', 'DEPARTMENT_USER', 'd1', '123', 'https://ui-avatars.com/api/?name=L%C3%AA%20V%C4%83n%20C')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `role`=VALUES(`role`), `departmentId`=VALUES(`departmentId`), `password`=VALUES(`password`), `avatarUrl`=VALUES(`avatarUrl`);

-- Seed ReportDefinitions
INSERT INTO `ReportDefinition` (`id`, `key`, `name`, `description`, `periodType`, `status`, `structure`) VALUES
('rd1', 'ops_monthly', 'Báo cáo Vận hành Tháng', 'Tổng hợp chỉ số vận hành máy móc và thời gian dừng máy.', 'monthly', 'active', '[{\"id\":\"machines_active\",\"label\":\"Số lượng máy hoạt động\",\"type\":\"number\",\"required\":true,\"unit\":\"máy\"},{\"id\":\"total_output\",\"label\":\"Tổng sản lượng\",\"type\":\"number\",\"required\":true,\"unit\":\"đơn vị\"},{\"id\":\"downtime_hours\",\"label\":\"Thời gian dừng máy\",\"type\":\"number\",\"required\":true,\"unit\":\"giờ\"},{\"id\":\"incident_count\",\"label\":\"Số sự cố ghi nhận\",\"type\":\"number\",\"required\":false},{\"id\":\"main_issue\",\"label\":\"Vấn đề chính gặp phải\",\"type\":\"text\",\"required\":false}]'),
('rd2', 'hr_weekly', 'Báo cáo Nhân sự Tuần', 'Biến động nhân sự hàng tuần.', 'weekly', 'active', '[{\"id\":\"new_hires\",\"label\":\"Tuyển mới\",\"type\":\"number\",\"required\":true},{\"id\":\"resignations\",\"label\":\"Nghỉ việc\",\"type\":\"number\",\"required\":true},{\"id\":\"department_mood\",\"label\":\"Đánh giá tinh thần\",\"type\":\"select\",\"options\":[\"Tốt\",\"Bình thường\",\"Căng thẳng\"],\"required\":true}]')
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`), `description`=VALUES(`description`), `periodType`=VALUES(`periodType`), `status`=VALUES(`status`), `structure`=VALUES(`structure`);

-- Seed Submissions (Sample)
INSERT INTO `ReportSubmission` (`id`, `reportDefinitionId`, `departmentId`, `submittedBy`, `submittedAt`, `periodStart`, `periodEnd`, `data`, `status`, `version`, `departmentName`) VALUES
('s1', 'rd1', 'd1', 'Nguyễn Văn A', '2023-10-05 10:00:00', '2023-10-01 00:00:00', '2023-10-31 00:00:00', '{\"machines_active\":45,\"total_output\":12000,\"downtime_hours\":12,\"incident_count\":2,\"main_issue\":\"Lỗi cảm biến băng chuyền\"}', 'SUBMITTED', 1, NULL)
ON DUPLICATE KEY UPDATE `data`=VALUES(`data`), `status`=VALUES(`status`);

SET FOREIGN_KEY_CHECKS = 1;
