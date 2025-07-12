import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const typeOrmConfigFactory = (configService: ConfigService): TypeOrmModuleOptions => {
  const config = {
    type: 'postgres' as const,
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USERNAME', 'postgres'),
    password: configService.get<string>('DB_PASSWORD', 'Admin123*'),
    database: configService.get<string>('DB_NAME', 'mentorny'),
    autoLoadEntities: true, // Automatically discover entities via forFeature
    synchronize: false,
    logging: configService.get<string>('NODE_ENV') === 'development',
  };

  // Log connection details (avoid in production)
  if (configService.get<string>('NODE_ENV') === 'development') {
    console.log('TypeORM Config:', {
      host: config.host,
      port: config.port,
      username: config.username,
      database: config.database,
    });
  }

  return config;
};

// Legacy export for backward compatibility (if needed)
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'Admin123*',
  database: process.env.DB_NAME || 'mentorny',
  autoLoadEntities: true,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};