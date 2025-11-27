import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';

export class RequestPasswordRecoveryDto {
  @ApiProperty({
    description: 'Email address of the user requesting password recovery',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    description: 'Language for the recovery email',
    example: 'es',
    enum: ['es', 'en'],
    required: false,
    default: 'es',
  })
  @IsOptional()
  @IsEnum(['es', 'en'], { message: 'Language must be either es or en' })
  language?: 'es' | 'en';
}

