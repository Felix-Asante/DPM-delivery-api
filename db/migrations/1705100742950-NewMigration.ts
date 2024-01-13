import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewMigration1705100742950 implements MigrationInterface {
  name = 'NewMigration1705100742950';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "offers" ALTER COLUMN "start_date" SET DEFAULT '"2024-01-12T23:05:46.036Z"'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "offers" ALTER COLUMN "start_date" SET DEFAULT '"2024-01-12T23:04:57.328Z"'`,
    );
  }
}
