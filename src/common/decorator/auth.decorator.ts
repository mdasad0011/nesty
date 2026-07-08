import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthGuard } from '../guard/auth.guard';
import { RolesGuard } from '../guard/roles.guard';
import { PermissionsGuard } from '../guard/permissions.guard';
import { Roles } from './roles.decorator';
import { Permissions } from './permissions.decorator';
import { Role } from '../enums/role.enum';

export function Auth(
  roles: Role | Role[] = [],
  permissions: string | string[] = [],
) {
  const roleArray = Array.isArray(roles) ? roles : [roles];
  const permissionArray = Array.isArray(permissions)
    ? permissions
    : [permissions];

  return applyDecorators(
    Roles(roleArray),
    Permissions(permissionArray),
    UseGuards(AuthGuard, RolesGuard, PermissionsGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
