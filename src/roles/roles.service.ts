import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleEntity } from './entities/role.entity';
import { PermissionEntity } from 'src/permissions/entities/permission.entity';
import { UserEntity } from 'src/users/entities/users.entity';
import { Role } from 'src/common/enums/role.enum';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(
    createRoleDto: CreateRoleDto,
    currentUser?: any,
  ): Promise<RoleEntity> {
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });
    if (existingRole) {
      throw new ConflictException(
        `Role with name "${createRoleDto.name}" already exists`,
      );
    }

    const { permissionIds, ...rest } = createRoleDto;

    if (permissionIds && permissionIds.length > 0) {
      const isAdmin =
        currentUser?.isAdmin || currentUser?.roles?.includes(Role.Admin);
      if (!isAdmin) {
        throw new ForbiddenException(
          'Only superadmin can assign permissions to roles',
        );
      }
    }

    const role = this.roleRepository.create(rest);

    if (permissionIds && permissionIds.length > 0) {
      const permissions = await this.permissionRepository.findBy({
        id: In(permissionIds),
      });
      role.permissions = permissions;
    } else {
      role.permissions = [];
    }

    return await this.roleRepository.save(role);
  }

  async findAll(): Promise<RoleEntity[]> {
    return await this.roleRepository.find({ relations: { permissions: true } });
  }

  async findOne(id: string): Promise<RoleEntity> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: { permissions: true },
    });
    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }
    return role;
  }

  async findByName(name: string): Promise<RoleEntity> {
    const role = await this.roleRepository.findOne({
      where: { name },
      relations: { permissions: true },
    });
    if (!role) {
      throw new NotFoundException(`Role with name "${name}" not found`);
    }
    return role;
  }

  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
    currentUser?: any,
  ): Promise<RoleEntity> {
    const role = await this.findOne(id);
    const { permissionIds, ...rest } = updateRoleDto;

    if (permissionIds) {
      const isAdmin =
        currentUser?.isAdmin || currentUser?.roles?.includes(Role.Admin);
      if (!isAdmin) {
        throw new ForbiddenException(
          'Only superadmin can assign permissions to roles',
        );
      }
    }

    Object.assign(role, rest);

    if (permissionIds) {
      if (permissionIds.length > 0) {
        const permissions = await this.permissionRepository.findBy({
          id: In(permissionIds),
        });
        role.permissions = permissions;
      } else {
        role.permissions = [];
      }
    }

    return await this.roleRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);
    const usersWithRole = await this.userRepository.count({
      where: { roleId: id },
    });
    if (usersWithRole > 0) {
      throw new ConflictException(
        `Cannot delete role; ${usersWithRole} user(s) are assigned to this role. Reassign or remove those users first.`,
      );
    }

    await this.roleRepository.remove(role);
  }
}
