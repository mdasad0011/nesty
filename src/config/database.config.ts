import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  DB_TYPE: process.env.DB_TYPE || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'root@123',
  name: process.env.DB_NAME || 'nesty',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: true,
  entities: [__dirname + '/entities/**/*{.js,.ts}'],
  subscribers: [__dirname + '/subscribers/**/*{.js,.ts}'],
  entitySchemas: [__dirname + '/schemas/**/*.json'],
  migrations: [__dirname + '/migrations/**/*{.js,.ts}'],
  seeds: ['src/seeds/**/*{.ts,.js}'],
  factories: ['src/factories/**/*{.ts,.js}'],
}));
