import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Logout status message',
    example: 'Successfully logged out',
  })
  message: string;

  @ApiProperty({ description: 'Logout success status', example: true })
  success: boolean;
}
