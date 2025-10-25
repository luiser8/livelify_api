import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, IsOptional, IsUrl } from 'class-validator';

export class UpdateUserProfileDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
    minLength: 2,
  })
  @IsString()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    minLength: 2,
  })
  @IsString()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  lastName: string;

  @ApiProperty({
    description: 'User address',
    example: '123 Main St, City, Country',
    minLength: 5,
  })
  @IsString()
  @MinLength(5, { message: 'Address must be at least 5 characters long' })
  address: string;

  @ApiProperty({
    description: 'User phone number',
    example: '+1234567890',
    minLength: 10,
  })
  @IsString()
  @MinLength(10, {
    message: 'Phone number must be at least 10 characters long',
  })
  phone: string;

  @ApiPropertyOptional({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Avatar URL must be a valid URL' })
  avatarUrl?: string;

  @ApiPropertyOptional({
    description:
      'User password - must be at least 6 characters (optional)',
    example: 'SecurePass123!',
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;
}
