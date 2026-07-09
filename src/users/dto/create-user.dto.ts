import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsStrongPassword,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsArray,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
    required: true,
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'The plain password of the user',
    required: true,
  })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
  })
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the user',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '+911234567890',
    description: 'The phone number of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'The username of the user',
    required: false,
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    description: 'Role name to assign to this user',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  roleName?: string;

  @ApiProperty({
    description:
      'Optional direct permissions to assign to the user (format: method:resource)',
    required: false,
    type: [String],
    example: ['get:users', 'post:users'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
