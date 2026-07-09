import { Factory, Seeder } from 'typeorm-seeding';
import { UserEntity } from '../../users/entities/users.entity';
import { RoleEntity } from '../../roles/entities/role.entity';
import { PermissionEntity } from '../../permissions/entities/permission.entity';
import { Role } from '../../common/enums/role.enum';

export default class CreateInitialData implements Seeder {
  public async run(factory: Factory, connection: any): Promise<any> {
    const permissionRepository = connection.getRepository(PermissionEntity);
    const roleRepository = connection.getRepository(RoleEntity);
    const userRepository = connection.getRepository(UserEntity);

    // 1. Create permissions
    const permissionsData = [
      {
        resource: 'users',
        description: 'Read users list',
        path: '/users',
        method: 'get',
        isDefault: true,
      },
      {
        resource: 'users',
        description: 'Create new user',
        path: '/users',
        method: 'post',
        isDefault: false,
      },
      {
        resource: 'users',
        description: 'Update existing user',
        path: '/users/:id',
        method: 'patch',
        isDefault: false,
      },
      {
        resource: 'users',
        description: 'Delete user',
        path: '/users/:id',
        method: 'delete',
        isDefault: false,
      },
      {
        resource: 'roles',
        description: 'Read roles list',
        path: '/roles',
        method: 'get',
        isDefault: true,
      },
      {
        resource: 'roles',
        description: 'Create new role',
        path: '/roles',
        method: 'post',
        isDefault: false,
      },
      {
        resource: 'roles',
        description: 'Update existing role',
        path: '/roles/:id',
        method: 'patch',
        isDefault: false,
      },
      {
        resource: 'roles',
        description: 'Delete role',
        path: '/roles/:id',
        method: 'delete',
        isDefault: false,
      },
    ];

    const savedPermissions: PermissionEntity[] = [];
    for (const p of permissionsData) {
      let perm = await permissionRepository.findOne({
        where: { description: p.description },
      });
      if (!perm) {
        perm = permissionRepository.create(p as any);
        perm = await permissionRepository.save(perm);
      }
      savedPermissions.push(perm);
    }

    // 2. Create roles (Admin and User)
    let adminRole = await roleRepository.findOne({
      where: { name: Role.Admin },
    });
    if (!adminRole) {
      adminRole = roleRepository.create({
        name: Role.Admin,
        description: 'Super administrator with all permissions',
        permissions: savedPermissions,
      });
      adminRole = await roleRepository.save(adminRole);
    } else {
      adminRole.permissions = savedPermissions;
      adminRole = await roleRepository.save(adminRole);
    }

    let userRole = await roleRepository.findOne({ where: { name: Role.User } });
    if (!userRole) {
      userRole = roleRepository.create({
        name: Role.User,
        description: 'Regular application user',
        permissions: savedPermissions.filter((p) => p.method === 'get'),
      });
      userRole = await roleRepository.save(userRole);
    }

    // 3. Create superadmin user
    let superadmin = await userRepository.findOne({
      where: { email: 'superadmin@example.com' },
    });
    if (!superadmin) {
      superadmin = userRepository.create({
        name: 'Super Admin',
        username: 'superadmin',
        email: 'superadmin@example.com',
        password: 'Admin@123',
        role: adminRole,
        roleId: adminRole.id,
        isActive: true,
        permissions: savedPermissions,
      });
      await userRepository.save(superadmin);
    } else {
      superadmin.password = 'Admin@123';
      superadmin.role = adminRole;
      superadmin.roleId = adminRole.id;
      superadmin.isActive = true;
      superadmin.permissions = savedPermissions;
      await userRepository.save(superadmin);
    }
  }
}
