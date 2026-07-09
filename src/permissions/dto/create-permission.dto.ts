import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'users',
    description: 'The resource this permission applies to',
  })
  resource: string;

  @ApiProperty({
    example: 'Read users list',
    description: 'Unique description of the permission',
  })
  description: string;

  @ApiProperty({
    example: '/users',
    description: 'The path for this permission',
  })
  path: string;

  @ApiProperty({ example: 'get', description: 'HTTP method' })
  method?: string;

  @ApiProperty({
    example: false,
    description: 'Whether this permission is a default permission',
  })
  isDefault?: boolean;
}
