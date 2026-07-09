import { Factory, Seeder } from 'typeorm-seeding';
import { UserEntity } from '../../users/entities/users.entity';
import { RoleEntity } from '../../roles/entities/role.entity';
import { PermissionEntity } from '../../permissions/entities/permission.entity';
import { Role } from '../../common/enums/role.enum';
import * as bcrypt from 'bcrypt';

export default class CreateInitialData implements Seeder {
  public async run(factory: Factory, connection: any): Promise<any> {
    const permissionRepository = connection.getRepository(PermissionEntity);
    const roleRepository = connection.getRepository(RoleEntity);
    const userRepository = connection.getRepository(UserEntity);

    // 1. Create permissions
    const permissionsData = [
      { action: 'read', subject: 'users', description: 'Read users list' },
      { action: 'create', subject: 'users', description: 'Create new user' },
      {
        action: 'update',
        subject: 'users',
        description: 'Update existing user',
      },
      { action: 'delete', subject: 'users', description: 'Delete user' },
      { action: 'read', subject: 'roles', description: 'Read roles list' },
      { action: 'create', subject: 'roles', description: 'Create new role' },
      {
        action: 'update',
        subject: 'roles',
        description: 'Update existing role',
      },
      { action: 'delete', subject: 'roles', description: 'Delete role' },
    ];

    const savedPermissions: PermissionEntity[] = [];
    for (const p of permissionsData) {
      let perm = await permissionRepository.findOne({
        where: { action: p.action, subject: p.subject },
      });
      if (!perm) {
        perm = permissionRepository.create(p);
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
        permissions: savedPermissions.filter((p) => p.action === 'read'),
      });
      userRole = await roleRepository.save(userRole);
    }

    // 3. Create superadmin user
    let superadmin = await userRepository.findOne({
      where: { email: 'superadmin@example.com' },
    });
    if (!superadmin) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('Admin@123', salt);

      superadmin = userRepository.create({
        name: 'Super Admin',
        username: 'superadmin',
        email: 'superadmin@example.com',
        password: hashedPassword,
        roles: [adminRole],
        roleId: adminRole.id,
        salt: salt,
        isAdmin: true,
        isActive: true,
      });
      await userRepository.save(superadmin);
    }
  }
}
