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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/common/guard/auth.guard';
import { PermissionsGuard } from 'src/common/guard/permissions.guard';
import { Permissions } from 'src/common/decorator/permissions.decorator';
import { User } from 'src/common/decorator/user.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(['get:user'])
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(['get:user'])
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(['patch:user'])
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() currentUser: any,
  ) {
    return this.usersService.update(id, updateUserDto, currentUser);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions(['delete:user'])
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
