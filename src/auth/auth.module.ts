import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';
import { UsersModule } from 'src/users/users.module';
@Module({
  imports: [
    UsersModule,
    ConfigModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const jwtSecret = configService.get<string>('JWT_SECRET');
        if (!jwtSecret) {
          throw new Error('JWT_SECRET environment variable must be defined');
        }

        return {
          secret: jwtSecret,
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRATION') || '60s',
          } as SignOptions,
        };
      },
    }),
    TypeOrmModule.forFeature([RefreshTokenEntity]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
