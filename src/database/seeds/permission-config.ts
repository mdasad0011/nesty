export enum MethodList {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  PATCH = 'patch',
  DELETE = 'delete',
  ANY = 'any',
  OPTIONS = 'options',
}

export interface RoutePayloadInterface {
  path: string;
  method: MethodList;
  resource?: string;
  description?: string;
  isDefault?: boolean;
}

export interface PermissionPayload {
  name: string;
  resource?: string;
  route: Array<RoutePayloadInterface>;
}

export interface SubModulePayloadInterface {
  name: string;
  resource?: string;
  route?: string;
  permissions?: Array<PermissionPayload>;
}

export interface ModulesPayloadInterface {
  name: string;
  resource: string;
  hasSubmodules: boolean;
  route?: string;
  submodules?: Array<SubModulePayloadInterface>;
  permissions?: Array<PermissionPayload>;
}

export interface rolePayload {
  name: string;
  description: string;
}

export interface PermissionConfigInterface {
  roles: Array<rolePayload>;
  defaultRoutes?: Array<RoutePayloadInterface>;
  modules: Array<ModulesPayloadInterface>;
}

export const PermissionConfiguration: PermissionConfigInterface = {
  roles: [
    {
      name: 'admin',
      description: 'admin user of the system',
    },
    {
      name: 'user',
      description: 'normal user of the system',
    },
  ],
  defaultRoutes: [
    {
      path: '/auth/login',
      method: MethodList.POST,
      description: 'Login to the application',
      isDefault: true,
    },
    {
      path: '/auth/refresh',
      method: MethodList.POST,
      description: 'Refresh access token',
      isDefault: true,
    },
    {
      path: '/auth/logout',
      method: MethodList.POST,
      description: 'Logout from the application',
      isDefault: true,
    },
  ],
  modules: [
    {
      name: 'User management',
      resource: 'user',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View all user',
          route: [
            {
              path: '/users',
              method: MethodList.GET,
              description: 'List all users',
            },
          ],
        },
        {
          name: 'Store new user',
          route: [
            {
              path: '/users',
              method: MethodList.POST,
              description: 'Create a new user',
            },
          ],
        },
        {
          name: 'Update user by id',
          route: [
            {
              path: '/users/:id',
              method: MethodList.PATCH,
              description: 'Update a user by id',
            },
          ],
        },
        {
          name: 'Get user by id',
          route: [
            {
              path: '/users/:id',
              method: MethodList.GET,
              description: 'Get user details by id',
            },
          ],
        },
        {
          name: 'Delete user by id',
          route: [
            {
              path: '/users/:id',
              method: MethodList.DELETE,
              description: 'Delete a user by id',
            },
          ],
        },
      ],
    },
    {
      name: 'Role management',
      resource: 'role',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View all role',
          route: [
            {
              path: '/roles',
              method: MethodList.GET,
              description: 'List all roles',
            },
          ],
        },
        {
          name: 'View role by id',
          route: [
            {
              path: '/roles/:id',
              method: MethodList.GET,
              description: 'Get a role by id',
            },
          ],
        },
        {
          name: 'Store new role',
          route: [
            {
              path: '/roles',
              method: MethodList.POST,
              description: 'Create a new role',
            },
          ],
        },
        {
          name: 'Update role by id',
          route: [
            {
              path: '/roles/:id',
              method: MethodList.PATCH,
              description: 'Update a role by id',
            },
          ],
        },
        {
          name: 'Delete role by id',
          route: [
            {
              path: '/roles/:id',
              method: MethodList.DELETE,
              description: 'Delete a role by id',
            },
          ],
        },
      ],
    },
    {
      name: 'Permission management',
      resource: 'permission',
      hasSubmodules: false,
      permissions: [
        {
          name: 'View all permission',
          route: [
            {
              path: '/permissions',
              method: MethodList.GET,
              description: 'List all permissions',
            },
          ],
        },
        {
          name: 'View permission by id',
          route: [
            {
              path: '/permissions/:id',
              method: MethodList.GET,
              description: 'Get a permission by id',
            },
          ],
        },
        {
          name: 'Store new permission',
          route: [
            {
              path: '/permissions',
              method: MethodList.POST,
              description: 'Create a new permission',
            },
          ],
        },
        {
          name: 'Update permission by id',
          route: [
            {
              path: '/permissions/:id',
              method: MethodList.PATCH,
              description: 'Update a permission by id',
            },
          ],
        },
        {
          name: 'Delete permission by id',
          route: [
            {
              path: '/permissions/:id',
              method: MethodList.DELETE,
              description: 'Delete a permission by id',
            },
          ],
        },
      ],
    },
  ],
};
