import { ApiProperty } from '@nestjs/swagger';

export class AreaResponseDto {
  @ApiProperty({
    description: 'Area ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Area name',
    example: 'Health & Fitness',
  })
  name: string;

  @ApiProperty({
    description: 'Area description',
    example: 'Physical and mental well-being',
  })
  description: string;

  @ApiProperty({
    description: 'Area icon or identifier',
    example: 'health-icon',
    required: false,
  })
  icon?: string;

  @ApiProperty({
    description: 'Display order',
    example: 1,
  })
  order: number;

  @ApiProperty({
    description: 'Whether the area is active',
    example: true,
  })
  isActive: boolean;
}

export class GetAllAreasResponseDto {
  @ApiProperty({
    description: 'List of available life areas',
    type: [AreaResponseDto],
  })
  areas: AreaResponseDto[];
}
