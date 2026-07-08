import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permissions } from '../decorator/permissions.decorator';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get(
      Permissions,
      context.getHandler(),
    );
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userPayload = request.user;
    if (!userPayload) {
      return false;
    }

    if (userPayload.isAdmin) {
      return true;
    }

    const user = await this.usersService.findOne(userPayload.sub);
    if (!user) {
      return false;
    }

    const userPermissions = user.roles.flatMap((role) =>
      role.permissions.map((p) => `${p.action}:${p.subject}`),
    );

    return requiredPermissions.every((perm) => userPermissions.includes(perm));
  }
}
