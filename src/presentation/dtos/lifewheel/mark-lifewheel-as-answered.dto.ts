import { ApiProperty } from '@nestjs/swagger';

export class MarkLifeWheelAsAnsweredResponseDto {
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
    description: 'Whether the LifeWheel questionnaire has been answered',
    example: true,
  })
  isAnswered: boolean;

  @ApiProperty({
    description: 'Global score (average of all areas)',
    example: 7.5,
  })
  globalScore: number;

  @ApiProperty({
    description: 'Last update date',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}

