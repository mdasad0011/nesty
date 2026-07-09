import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PermissionEntity } from 'src/permissions/entities/permission.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/users.entity';
import { RoleEntity } from 'src/roles/entities/role.entity';
import { Role } from 'src/common/enums/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<{ id: string; message: string }> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new ConflictException(
        `User with email "${createUserDto.email}" already exists`,
      );
    }

    const role = await this.roleRepository.findOne({
      where: { name: createUserDto.roleName },
    });
    if (!role) {
      throw new NotFoundException(
        `Role with name "${createUserDto.roleName}" not found`,
      );
    }

    const { ...rest } = createUserDto as any;

    const user = this.userRepository.create({
      ...rest,
      role,
    }) as any;
    const savedUser = await this.userRepository.save(user);
    return { id: savedUser.id, message: 'User created successfully' };
  }

  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.find({
      relations: { role: { permissions: true }, permissions: true },
    });
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { role: { permissions: true }, permissions: true },
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: { role: { permissions: true }, permissions: true },
    });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    currentUser?: any,
  ): Promise<UserEntity> {
    const user = await this.findOne(id);
    const {
      roleName,
      password,
      permissions: permissionStrings,
      ...rest
    } = updateUserDto as any;

    if (roleName || permissionStrings) {
      const isAdmin =
        currentUser?.isAdmin || currentUser?.roles?.includes(Role.Admin);
      if (!isAdmin) {
        throw new ForbiddenException(
          'Only superadmin can assign roles or permissions to users',
        );
      }
    }

    Object.assign(user, rest);

    if (password) {
      user.salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(password, user.salt);
    }

    if (roleName) {
      const role = await this.roleRepository.findOne({
        where: { name: roleName },
      });
      if (role) {
        user.role = role;
      }
    }

    if (permissionStrings) {
      const allPermissions = await this.permissionRepository.find();
      const permSet = new Set(permissionStrings);
      user.permissions = allPermissions.filter((p) =>
        permSet.has(`${p.method}:${p.resource}`),
      );
    }

    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
