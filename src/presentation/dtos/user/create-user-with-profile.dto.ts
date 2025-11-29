import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsUrl,
  IsBoolean,
  IsIn,
  IsEnum,
} from 'class-validator';
import { TypeCreation } from 'src/domain/entities/user/user.entity';

export class CreateUserWithProfileDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  email: string;

  @ApiProperty({
    description:
      'User password - must be at least 8 characters with uppercase, lowercase, number and special character',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  // Profile fields
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

  @ApiProperty({
    description: 'User must accept terms and conditions',
    example: true,
  })
  @IsBoolean({ message: 'Accept terms and policies must be a boolean' })
  acceptTermsAndPolicies: boolean;

  @ApiPropertyOptional({
    description: 'Currency ID for the user (defaults to USD if not provided)',
    example: 'currency-usd-id-here',
  })
  @IsOptional()
  @IsString()
  currencyId?: string;

  @ApiPropertyOptional({
    description:
      'Language for activation email (es for Spanish, en for English, defaults to es)',
    example: 'es',
    enum: ['es', 'en'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['es', 'en'], { message: 'Language must be either "es" or "en"' })
  language?: 'es' | 'en';

  @ApiProperty({
    description: 'Type of creation',
    enum: TypeCreation,
    example: 'APPLICATION',
  })
  @IsEnum(TypeCreation)
  typeCreation: TypeCreation;
}
