import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcrypt';

export class SeedAdminUser1751708653245 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if admin user already exists
    const existingAdmin = await queryRunner.query(
      `SELECT id FROM "user" WHERE "email" = 'BessaAdmin@mentorny.com'`
    );
    
    if (existingAdmin.length === 0) {
      // Hash the password
      const hashedPassword = await bcrypt.hash('Admin123*', 10);
      
      // Insert the admin user
      await queryRunner.query(`
        INSERT INTO "user" ("email", "password", "name", "age", "roles")
        VALUES ('BessaAdmin@mentorny.com', '${hashedPassword}', 'Abdelziz Elbessa', 22, 'admin')
      `);
      
      console.log('Admin user created successfully!');
    } else {
      console.log('Admin user already exists, skipping creation.');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the admin user
    await queryRunner.query(`
      DELETE FROM "user" WHERE "email" = 'BessaAdmin@mentorny.com'
    `);
    console.log('Admin user removed.');
  }
}