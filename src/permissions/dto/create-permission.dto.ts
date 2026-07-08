import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({ example: 'read', description: 'The action of the permission' })
  action: string;

  @ApiProperty({
    example: 'Article',
    description: 'The subject class or entity name',
  })
  subject: string;

  @ApiProperty({
    example: 'Allows reading all articles',
    description: 'A description of the permission',
    required: false,
  })
  description?: string;
}
