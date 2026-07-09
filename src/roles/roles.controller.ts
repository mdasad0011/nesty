import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { PermissionsGuard } from 'src/common/guard/permissions.guard';
import { Permissions } from 'src/common/decorator/permissions.decorator';
import { User } from 'src/common/decorator/user.decorator';

@ApiTags('roles')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @Permissions(['post:role'])
  create(@Body() createRoleDto: CreateRoleDto, @User() currentUser: any) {
    return this.rolesService.create(createRoleDto, currentUser);
  }

  @Get()
  @Permissions(['get:role'])
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @Permissions(['get:role'])
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @Permissions(['patch:role'])
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @User() currentUser: any,
  ) {
    return this.rolesService.update(id, updateRoleDto, currentUser);
  }

  @Delete(':id')
  @Permissions(['delete:role'])
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
