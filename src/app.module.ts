import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './common/guard/roles.guard';
import { CaslModule } from './casl/casl.module';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { WinstonModule } from 'nest-winston';
import winstonConfig from './config/winston.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (): TypeOrmModuleOptions => ({
        type: (process.env.DB_TYPE as any) || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'root@123',
        database: process.env.DB_NAME || 'nesty',
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== 'production',
      }),
    }),
    ThrottlerModule.forRootAsync({
      useFactory: (): ThrottlerModuleOptions =>
        ({
          ttl: Number(process.env.THROTTLE_TTL) || 60,
          limit: Number(process.env.THROTTLE_LIMIT) || 10,
        }) as unknown as ThrottlerModuleOptions,
    }),
    WinstonModule.forRoot(winstonConfig),
    UsersModule,
    AuthModule,
    HealthModule,
    CaslModule,
    RolesModule,
    PermissionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
