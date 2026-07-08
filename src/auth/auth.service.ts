import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { RoleEntity } from 'src/roles/entities/role.entity';
import { UserEntity } from 'src/users/entities/users.entity';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepository: Repository<RefreshTokenEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<UserEntity> {
    const { roles, password, ...rest } = signUpDto;

    const existing = await this.usersService.findByEmail(signUpDto.email);
    if (existing) {
      throw new ConflictException(
        `User with email "${signUpDto.email}" already exists`,
      );
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new UserEntity();
    Object.assign(user, rest);
    user.salt = salt;
    user.password = hashedPassword;

    if (roles && roles.length > 0) {
      const roleEntities = await this.roleRepository.findBy({
        name: In(roles),
      });
      user.roles = roleEntities;
    } else {
      const defaultRole = await this.roleRepository.findOne({
        where: { name: 'user' },
      });
      user.roles = defaultRole ? [defaultRole] : [];
    }

    return await user.save();
  }

  async signIn(
    signInDto: SignInDto,
    ip: string,
    userAgent: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: UserEntity }> {
    const user = await this.usersService.findByEmail(signInDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await user.validatePassword(signInDto.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user, ip, userAgent);
    return {
      ...tokens,
      user,
    };
  }

  async refresh(
    refreshToken: string,
    ip: string,
    userAgent: string,
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

    return await this.generateTokens(user, ip, userAgent);
  }

  async signOut(refreshToken: string): Promise<void> {
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
    userAgent: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles?.map((r) => r.name) || [],
      isAdmin: user.isAdmin,
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
      userAgent: userAgent || 'unknown',
      browser: this.parseBrowser(userAgent),
      os: this.parseOs(userAgent),
      isRevoked: false,
      expires,
    });

    await this.refreshTokenRepository.save(refreshTokenEntity);

    return {
      accessToken,
      refreshToken: refreshTokenId,
    };
  }

  private parseBrowser(userAgent: string): string {
    if (!userAgent) return 'Unknown';
    if (/chrome/i.test(userAgent)) return 'Chrome';
    if (/safari/i.test(userAgent)) return 'Safari';
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/msie|trident/i.test(userAgent)) return 'Internet Explorer';
    return 'Other';
  }

  private parseOs(userAgent: string): string {
    if (!userAgent) return 'Unknown';
    if (/windows/i.test(userAgent)) return 'Windows';
    if (/macintosh|mac os x/i.test(userAgent)) return 'macOS';
    if (/linux/i.test(userAgent)) return 'Linux';
    if (/android/i.test(userAgent)) return 'Android';
    if (/iphone|ipad/i.test(userAgent)) return 'iOS';
    return 'Other';
  }
}
