import { ApiProperty } from '@nestjs/swagger';

export class LifeWheelAreaDto {
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
    description: 'Area score based on answers (0-10)',
    example: 7.5,
  })
  score: number;

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

export class GetUserLifeWheelResponseDto {
  @ApiProperty({
    description: 'LifeWheel ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Global score (average of all areas with answers)',
    example: 6.8,
  })
  globalScore: number;

  @ApiProperty({
    description: 'Life areas with their scores',
    type: [LifeWheelAreaDto],
  })
  lifeAreas: LifeWheelAreaDto[];

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
