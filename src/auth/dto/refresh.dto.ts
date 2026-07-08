import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({
    example: 'refresh-token-uuid-here',
    description: 'The UUID refresh token',
  })
  refreshToken: string;
}
