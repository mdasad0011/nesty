import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email address of the user',
  })
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'The password of the user',
  })
  password: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'The full name of the user',
  })
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
    example: ['admin'],
    description: 'List of role names to assign (optional)',
    required: false,
    type: [String],
  })
  roles?: string[];
}
