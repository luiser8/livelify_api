import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ActivateAccountDto {
  @ApiProperty({
    description: 'Activation hash sent via email',
    example: '7f3e8c9a1b2d4e6f8a0c1d3e5f7b9d0e1c3a5b7d9f0e2c4a6b8d0e2f4a6c8e0a',
  })
  @IsNotEmpty()
  @IsString()
  hash: string;
}

export class ActivateAccountResponseDto {
  @ApiProperty({
    description: 'Indicates if the activation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Activation result message',
    example: 'Account activated successfully',
  })
  message: string;
}
