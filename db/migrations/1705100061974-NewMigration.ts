import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewMigration1705100061974 implements MigrationInterface {
  name = 'NewMigration1705100061974';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "offers" ALTER COLUMN "start_date" SET DEFAULT '"2024-01-12T22:54:23.135Z"'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "offers" ALTER COLUMN "start_date" SET DEFAULT '"2024-01-12T22:44:51.469Z"'`,
    );
  }
}
