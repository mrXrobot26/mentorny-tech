import { MigrationInterface, QueryRunner } from "typeorm";

export class SkillsAndRelation1751889989068 implements MigrationInterface {
    name = 'SkillsAndRelation1751889989068'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "skill" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a0d33334424e64fb78dc3ce7196" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_skills_skill" ("userId" integer NOT NULL, "skillId" integer NOT NULL, CONSTRAINT "PK_972b9abaae51dbb33e482d81a26" PRIMARY KEY ("userId", "skillId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b5cce6242aae7bce521a76a3be" ON "user_skills_skill" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_c7e4f0b8d58a56f71dd097d754" ON "user_skills_skill" ("skillId") `);
        await queryRunner.query(`ALTER TABLE "user_skills_skill" ADD CONSTRAINT "FK_b5cce6242aae7bce521a76a3be1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_skills_skill" ADD CONSTRAINT "FK_c7e4f0b8d58a56f71dd097d7546" FOREIGN KEY ("skillId") REFERENCES "skill"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_skills_skill" DROP CONSTRAINT "FK_c7e4f0b8d58a56f71dd097d7546"`);
        await queryRunner.query(`ALTER TABLE "user_skills_skill" DROP CONSTRAINT "FK_b5cce6242aae7bce521a76a3be1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c7e4f0b8d58a56f71dd097d754"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b5cce6242aae7bce521a76a3be"`);
        await queryRunner.query(`DROP TABLE "user_skills_skill"`);
        await queryRunner.query(`DROP TABLE "skill"`);
    }

}
