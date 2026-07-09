import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permissions } from '../decorator/permissions.decorator';
import { UsersService } from 'src/users/users.service';
import { Role } from '../enums/role.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userPayload = request.user;
    if (!userPayload) {
      return false;
    }

    // SuperAdmin bypasses all permission checks
    if (userPayload.isAdmin || userPayload.roles?.includes(Role.Admin)) {
      return true;
    }

    const requiredPermissions = this.reflector.get(
      Permissions,
      context.getHandler(),
    );

    if (requiredPermissions === undefined) {
      throw new ForbiddenException('Permissions not defined for this endpoint');
    }

    if (requiredPermissions.length === 0) {
      return true;
    }

    const user = await this.usersService.findOne(userPayload.id);
    if (!user) {
      return false;
    }

    const rolePermissions = user.role?.permissions
      ? user.role.permissions.map((p) => `${p.method}:${p.resource}`)
      : [];

    const directPermissions = user.permissions
      ? user.permissions.map((p) => `${p.method}:${p.resource}`)
      : [];

    const userPermissionsSet = new Set<string>([
      ...rolePermissions,
      ...directPermissions,
    ]);

    return requiredPermissions.every((perm) => userPermissionsSet.has(perm));
  }
}
