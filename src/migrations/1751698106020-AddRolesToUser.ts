import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRolesToUser1751698106020 implements MigrationInterface {
    name = 'AddRolesToUser1751698106020'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "roles" text NOT NULL DEFAULT 'user'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "roles"`);
    }

}
