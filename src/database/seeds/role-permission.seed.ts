import { Factory, Seeder } from 'typeorm-seeding';
import { UserEntity } from '../../users/entities/users.entity';
import { RoleEntity } from '../../roles/entities/role.entity';
import { PermissionEntity } from '../../permissions/entities/permission.entity';
import { Role } from '../../common/enums/role.enum';
import {
  PermissionConfiguration,
  MethodList,
  RoutePayloadInterface,
} from './permission-config';

function buildPermissionDescription(
  route: RoutePayloadInterface,
  moduleName?: string,
) {
  if (route.description) {
    return route.description;
  }

  const resource = route.resource ?? moduleName ?? 'unknown';
  return `${route.method.toUpperCase()} ${route.path} (${resource})`;
}

function normalizeResource(
  route: RoutePayloadInterface,
  moduleResource?: string,
) {
  return route.resource ?? moduleResource ?? 'unknown';
}

export default class CreateInitialData implements Seeder {
  public async run(factory: Factory, connection: any): Promise<any> {
    const permissionRepository = connection.getRepository(PermissionEntity);
    const roleRepository = connection.getRepository(RoleEntity);
    const userRepository = connection.getRepository(UserEntity);

    const permissionEntities: PermissionEntity[] = [];

    const upsertPermission = async (
      route: RoutePayloadInterface,
      moduleResource?: string,
      isDefault = false,
    ) => {
      const description = buildPermissionDescription(route, moduleResource);
      const resource = normalizeResource(route, moduleResource);
      let permission = await permissionRepository.findOne({
        where: { description },
      });

      if (!permission) {
        permission = permissionRepository.create({
          resource,
          description,
          path: route.path,
          method: route.method,
          isDefault,
        } as any);
        permission = await permissionRepository.save(permission);
      } else {
        permission.path = route.path;
        permission.method = route.method;
        permission.resource = resource;
        permission.isDefault = isDefault;
        permission = await permissionRepository.save(permission);
      }

      permissionEntities.push(permission);
      return permission;
    };

    if (PermissionConfiguration.defaultRoutes) {
      for (const route of PermissionConfiguration.defaultRoutes) {
        await upsertPermission(route, undefined, true);
      }
    }

    for (const moduleConfig of PermissionConfiguration.modules) {
      if (moduleConfig.permissions) {
        for (const permission of moduleConfig.permissions) {
          for (const route of permission.route) {
            await upsertPermission(route, moduleConfig.resource, false);
          }
        }
      }

      if (moduleConfig.hasSubmodules && moduleConfig.submodules) {
        for (const submodule of moduleConfig.submodules) {
          if (submodule.permissions) {
            for (const permission of submodule.permissions) {
              for (const route of permission.route) {
                await upsertPermission(
                  route,
                  submodule.resource ?? moduleConfig.resource,
                  false,
                );
              }
            }
          }
        }
      }
    }

    const allPermissions = await permissionRepository.find();

    const rolePermissionMap: Record<string, PermissionEntity[]> = {};
    for (const roleConfig of PermissionConfiguration.roles) {
      if (roleConfig.name === Role.Admin) {
        rolePermissionMap[roleConfig.name] = allPermissions;
      } else {
        rolePermissionMap[roleConfig.name] = allPermissions.filter(
          (permission) =>
            permission.isDefault || permission.method === MethodList.GET,
        );
      }
    }

    for (const roleConfig of PermissionConfiguration.roles) {
      let role = await roleRepository.findOne({
        where: { name: roleConfig.name },
        relations: { permissions: true },
      });

      const rolePermissions = rolePermissionMap[roleConfig.name] || [];
      if (!role) {
        role = roleRepository.create({
          name: roleConfig.name,
          description: roleConfig.description,
          permissions: rolePermissions,
        });
      } else {
        role.description = roleConfig.description;
        role.permissions = rolePermissions;
      }

      await roleRepository.save(role);
    }

    const superuserRole = await roleRepository.findOne({
      where: { name: Role.Admin },
      relations: { permissions: true },
    });

    if (superuserRole) {
      let superadmin = await userRepository.findOne({
        where: { email: 'super@example.com' },
      });

      if (!superadmin) {
        superadmin = userRepository.create({
          name: 'Super Admin',
          username: 'superadmin',
          email: 'super@example.com',
          password: 'Super@123',
          role: superuserRole,
          roleId: superuserRole.id,
          isActive: true,
          permissions: allPermissions,
        });
      } else {
        superadmin.role = superuserRole;
        superadmin.roleId = superuserRole.id;
        superadmin.isActive = true;
        superadmin.permissions = allPermissions;
        superadmin.password = 'Admin@123';
      }

      await userRepository.save(superadmin);
    }
  }
}
