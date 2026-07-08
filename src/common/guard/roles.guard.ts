import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return false;
    }
    return this.matchRoles(roles, user.roles);
  }

  private matchRoles(
    allowedRoles: Role[],
    userRoles: Role[] | string[],
  ): boolean {
    if (!userRoles) return false;
    return allowedRoles.some((role) => userRoles.includes(role));
  }
}
