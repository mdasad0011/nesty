import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({
    example: 'ea451b89d91b3cb84f641e4971561092e5189ac5206ce6f5c16055452860982c',
    description: 'enter the refresh token',
  })
  @IsNotEmpty({ message: 'Refresh token should not be empty' })
  @IsString({ message: 'Refresh token must be a string' })
  refreshToken: string;
}
