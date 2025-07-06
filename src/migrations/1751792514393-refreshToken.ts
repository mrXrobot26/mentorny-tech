import { MigrationInterface, QueryRunner } from "typeorm";

export class RefreshToken1751792514393 implements MigrationInterface {
    name = 'RefreshToken1751792514393'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "refreshTokenHash" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "refreshTokenExpiresAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "refreshTokenExpiresAt"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "refreshTokenHash"`);
    }

}
