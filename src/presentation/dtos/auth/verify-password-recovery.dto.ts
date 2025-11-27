import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPasswordRecoveryDto {
  @ApiProperty({
    description: 'Recovery hash from email link',
    example: 'abc123def456',
  })
  @IsString()
  @IsNotEmpty()
  hash: string;
}

export class VerifyPasswordRecoveryResponseDto {
  @ApiProperty({
    description: 'Whether the recovery link is valid',
    example: true,
  })
  valid: boolean;

  @ApiProperty({
    description: 'Message describing the status',
    example: 'Recovery link is valid',
  })
  message: string;

  @ApiProperty({
    description: 'Whether the link has already been processed',
    example: false,
    required: false,
  })
  alreadyProcessed?: boolean;

  @ApiProperty({
    description: 'Whether the link has expired',
    example: false,
    required: false,
  })
  expired?: boolean;
}
