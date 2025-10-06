import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateProjectStatusDto {
  @ApiProperty({
    description: 'New project status',
    enum: ['ACTIVE', 'SOMEDAY', 'COMPLETED', 'CANCELLED'],
    example: 'COMPLETED',
  })
  @IsEnum(['ACTIVE', 'SOMEDAY', 'COMPLETED', 'CANCELLED'])
  status: 'ACTIVE' | 'SOMEDAY' | 'COMPLETED' | 'CANCELLED';
}

export class UpdateProjectStatusResponseDto {
  @ApiProperty({
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Project title',
    example: 'Improve Physical Fitness',
  })
  title: string;

  @ApiProperty({
    description: 'Project status',
    enum: ['ACTIVE', 'SOMEDAY', 'COMPLETED', 'CANCELLED'],
    example: 'COMPLETED',
  })
  status: string;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

