import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'admin', description: 'The unique name of the role' })
  name: string;

  @ApiProperty({
    example: 'Administrator role with full access',
    description: 'A description of the role',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: ['uuid-1', 'uuid-2'],
    description: 'Array of Permission IDs to associate with this role',
    required: false,
    type: [String],
  })
  permissionIds?: string[];
}
