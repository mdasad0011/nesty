import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'The plain password of the user',
  })
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'The name of the user' })
  name: string;

  @ApiProperty({
    example: '+1234567890',
    description: 'The phone number of the user',
    required: false,
  })
  phoneNumber?: string;

  @ApiProperty({
    example: 'johndoe',
    description: 'The username of the user',
    required: false,
  })
  username?: string;

  @ApiProperty({
    example: 'uuid-1',
    description: 'Role ID to assign to this user',
    required: false,
    type: String,
  })
  roleId?: string;
}
