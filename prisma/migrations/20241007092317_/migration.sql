/*
  Warnings:

  - You are about to drop the column `title` on the `Employe` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ref]` on the table `Computer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `Employe` will be added. If there are existing duplicate values, this will fail.
  - Made the column `ref` on table `Computer` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `email` to the `Employe` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Employe` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Computer` MODIFY `ref` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Employe` DROP COLUMN `title`,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `gender` ENUM('Mr', 'Ms') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Computer_ref_key` ON `Computer`(`ref`);

-- CreateIndex
CREATE UNIQUE INDEX `Employe_email_key` ON `Employe`(`email`);
