import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  Matches,
  IsOptional,
  IsIn,
} from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Recovery hash from the email link',
    example: 'abc123def456...',
  })
  @IsString()
  hash: string;

  @ApiProperty({
    description:
      'New password (min 6 characters, must include uppercase, lowercase, number)',
    example: 'NewPassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  newPassword: string;

  @ApiProperty({
    description: 'Language for the confirmation email',
    example: 'es',
    enum: ['es', 'en'],
    required: false,
    default: 'es',
  })
  @IsOptional()
  @IsString()
  @IsIn(['es', 'en'], { message: 'Language must be either "es" or "en"' })
  language?: 'es' | 'en';
}
