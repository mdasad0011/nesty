import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RoleEntity } from './entities/role.entity';
import { PermissionEntity } from 'src/permissions/entities/permission.entity';
import { UsersService } from 'src/users/users.service';

describe('RolesController', () => {
  let controller: RolesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        RolesService,
        {
          provide: getRepositoryToken(RoleEntity),
          useValue: {},
        },
        {
          provide: getRepositoryToken(PermissionEntity),
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {},
        },
        {
          provide: UsersService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
