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
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { PermissionsGuard } from 'src/common/guard/permissions.guard';
import { Permissions } from 'src/common/decorator/permissions.decorator';

@ApiTags('permissions')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Permissions(['post:permission'])
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @Permissions(['get:permission'])
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @Permissions(['get:permission'])
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @Permissions(['patch:permission'])
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @Permissions(['delete:permission'])
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }
}
