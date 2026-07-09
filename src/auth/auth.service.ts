import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes, createHmac } from 'crypto';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { UserEntity } from 'src/users/entities/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  async login(
    loginDto: LoginDto,
    ip: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await user.validatePassword(loginDto.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user, ip);
    return tokens;
  }

  async refresh(
    refreshToken: string,
    ip: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenEntity = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (
      !tokenEntity ||
      tokenEntity.isRevoked ||
      new Date() > tokenEntity.expires
    ) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    tokenEntity.isRevoked = true;
    await this.refreshTokenRepository.save(tokenEntity);

    const user = await this.usersService.findOne(tokenEntity.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return await this.generateTokens(user, ip);
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenEntity = await this.refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });
    if (tokenEntity) {
      tokenEntity.isRevoked = true;
      await this.refreshTokenRepository.save(tokenEntity);
    }
  }

  private async generateTokens(
    user: UserEntity,
    ip: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      id: user.id,
      email: user.email,
      roles: user.role ? [user.role.name] : [],
      roleId: user.roleId,
      permissions: Array.from(
        new Set([
          ...(user.role?.permissions
            ? user.role.permissions.map((p) => `${p.method}:${p.resource}`)
            : []),
          ...(user.permissions
            ? user.permissions.map((p) => `${p.method}:${p.resource}`)
            : []),
        ]),
      ),
    };

    const accessTokenExpiration =
      this.configService.get<string>('JWT_EXPIRATION') || '15m';

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: accessTokenExpiration as any,
    });

    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    if (!refreshSecret) {
      throw new Error(
        'JWT_REFRESH_SECRET environment variable must be defined',
      );
    }

    const refreshTokenExpiration =
      this.configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';

    const refreshTokenId = randomBytes(32).toString('hex');
    const refreshToken = createHmac('sha256', refreshSecret)
      .update(refreshTokenId)
      .digest('hex');

    const expires = this.calculateExpiryDate(refreshTokenExpiration);

    const refreshTokenEntity = this.refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      ip: ip || '127.0.0.1',
      userAgent: 'unknown',
      browser: 'Unknown',
      os: 'Unknown',
      isRevoked: false,
      expires,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return {
      accessToken,
      refreshToken,
    };
  }

  private calculateExpiryDate(expiration: string): Date {
    const date = new Date();
    const value = Number(expiration.slice(0, -1));
    const unit = expiration.slice(-1);

    if (Number.isNaN(value)) {
      date.setDate(date.getDate() + 7);
      return date;
    }

    switch (unit) {
      case 'd':
        date.setDate(date.getDate() + value);
        break;
      case 'h':
        date.setHours(date.getHours() + value);
        break;
      case 'm':
        date.setMinutes(date.getMinutes() + value);
        break;
      case 's':
        date.setSeconds(date.getSeconds() + value);
        break;
      default:
        date.setDate(date.getDate() + 7);
    }

    return date;
  }
}
