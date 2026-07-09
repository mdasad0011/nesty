import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/users.entity';
import { RoleEntity } from 'src/roles/entities/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new ConflictException(
        `User with email "${createUserDto.email}" already exists`,
      );
    }

    const { roleId, ...rest } = createUserDto;
    const user = this.userRepository.create(rest);

    let role: RoleEntity | null = null;
    if (roleId) {
      role = await this.roleRepository.findOne({ where: { id: roleId } });
    }
    if (!role) {
      role = await this.roleRepository.findOne({ where: { name: 'user' } });
    }
    if (role) {
      user.role = role;
    }

    return await this.userRepository.save(user);
  }

  async findAll(): Promise<UserEntity[]> {
    return await this.userRepository.find({
      relations: { role: { permissions: true } },
    });
  }

  async findOne(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { role: { permissions: true } },
    });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: { role: { permissions: true } },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findOne(id);
    const { roleId, password, ...rest } = updateUserDto;

    Object.assign(user, rest);

    if (password) {
      user.salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(password, user.salt);
    }

    if (roleId) {
      const role = await this.roleRepository.findOne({ where: { id: roleId } });
      if (role) {
        user.role = role;
      }
    }

    return await this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }
}
