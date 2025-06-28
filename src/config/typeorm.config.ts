import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin123*',
  database: process.env.DB_NAME || 'mentorny',
  autoLoadEntities: true, // Automatically discover entities via forFeature
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

// Log connection details (avoid in production)
if (process.env.NODE_ENV === 'development') {
  console.log('TypeORM Config:', {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
    username: process.env.DB_USERNAME || 'postgres',
    database: process.env.DB_NAME || 'mentorny',
  });
}