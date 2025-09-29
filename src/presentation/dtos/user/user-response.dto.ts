import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty({
    description: 'Profile ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({ description: 'User first name', example: 'John' })
  firstName: string;

  @ApiProperty({ description: 'User last name', example: 'Doe' })
  lastName: string;

  @ApiProperty({ description: 'User full name', example: 'John Doe' })
  fullName: string;

  @ApiProperty({
    description: 'User address',
    example: '123 Main St, City, Country',
  })
  address: string;

  @ApiProperty({ description: 'User phone', example: '+1234567890' })
  phone: string;

  @ApiPropertyOptional({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  avatarUrl?: string;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @ApiPropertyOptional({
    description: 'User profile',
    type: UserProfileResponseDto,
  })
  profile?: UserProfileResponseDto;

  @ApiProperty({
    description: 'Creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class CreateUserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}

export class LifeWheelAreaResponseDto {
  @ApiProperty({
    description: 'LifeWheelArea ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Area ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  areaId: string;

  @ApiProperty({
    description: 'Area name',
    example: 'PERSONAL_DEVELOPMENT',
  })
  areaName: string;

  @ApiProperty({
    description: 'Area score (0-10)',
    example: 7.5,
  })
  score: number;
}

export class LifeWheelResponseDto {
  @ApiProperty({
    description: 'LifeWheel ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Global score (average of all areas)',
    example: 6.8,
  })
  globalScore: number;

  @ApiProperty({
    description: 'Life areas',
    type: [LifeWheelAreaResponseDto],
  })
  lifeAreas: LifeWheelAreaResponseDto[];
}

export class CreateUserWithProfileResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @ApiProperty({
    description: 'User profile',
    type: UserProfileResponseDto,
  })
  profile: UserProfileResponseDto;

  @ApiProperty({
    description: 'User LifeWheel with all predefined areas',
    type: LifeWheelResponseDto,
  })
  lifeWheel: LifeWheelResponseDto;

  @ApiProperty({
    description: 'Creation date',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}

export class AuthenticateUserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({ description: 'User email', example: 'user@example.com' })
  email: string;

  @ApiProperty({ description: 'Authentication status', example: true })
  isAuthenticated: boolean;
}
