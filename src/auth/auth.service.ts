import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { UserEntity } from 'src/users/entities/users.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
  ) {}

  async login(
    loginDto: LoginDto,
    ip: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: UserEntity }> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await user.validatePassword(loginDto.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user, ip);
    return {
      ...tokens,
      user,
    };
  }

  async refresh(
    refreshToken: string,
    ip: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokenEntity = await this.refreshTokenRepository.findOne({
      where: { id: refreshToken },
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
      where: { id: refreshToken },
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
      sub: user.id,
      email: user.email,
      roles: user.role ? [user.role.name] : [],
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: (process.env.JWT_EXPIRATION as any) || '15m',
    });

    const refreshTokenId = uuidv4();
    const expires = new Date();
    expires.setDate(expires.getDate() + 7);

    const refreshTokenEntity = this.refreshTokenRepository.create({
      id: refreshTokenId,
      userId: user.id,
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
      refreshToken: refreshTokenId,
    };
  }
}
