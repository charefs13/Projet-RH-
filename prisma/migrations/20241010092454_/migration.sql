/*
  Warnings:

  - You are about to drop the column `isRecurring` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the `Recurrence` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Recurrence` DROP FOREIGN KEY `Recurrence_taskId_fkey`;

-- AlterTable
ALTER TABLE `Task` DROP COLUMN `isRecurring`;

-- DropTable
DROP TABLE `Recurrence`;
